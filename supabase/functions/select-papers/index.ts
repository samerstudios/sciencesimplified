import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  pubDate: string;
  doi: string;
}

async function searchPubMed(subject: string, startDate: string, endDate: string): Promise<PubMedArticle[]> {
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(subject)}+AND+${startDate}:${endDate}[pdat]&retmax=100&retmode=json&sort=relevance`;
  
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();
  const pmids = searchData.esearchresult?.idlist || [];
  
  if (pmids.length === 0) return [];
  
  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  const fetchResponse = await fetch(fetchUrl);
  const xmlText = await fetchResponse.text();
  
  return parsePubMedXML(xmlText);
}

function parsePubMedXML(xml: string): PubMedArticle[] {
  const articles: PubMedArticle[] = [];
  const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
  
  for (const articleXml of articleMatches) {
    const pmid = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] || '';
    const title = articleXml.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1] || '';
    const abstractMatch = articleXml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
    const abstract = abstractMatch ? abstractMatch[1].replace(/<[^>]+>/g, '') : '';
    
    const authorMatches = articleXml.match(/<Author[^>]*>[\s\S]*?<\/Author>/g) || [];
    const authors = authorMatches.map(author => {
      const lastName = author.match(/<LastName>(.*?)<\/LastName>/)?.[1] || '';
      const foreName = author.match(/<ForeName>(.*?)<\/ForeName>/)?.[1] || '';
      return `${foreName} ${lastName}`.trim();
    }).filter(Boolean).join(', ');
    
    const journal = articleXml.match(/<Title>(.*?)<\/Title>/)?.[1] || '';
    const pubDate = articleXml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] || '';
    const doi = articleXml.match(/<ArticleId IdType="doi">(.*?)<\/ArticleId>/)?.[1] || '';
    
    if (pmid && title) {
      articles.push({ pmid, title, abstract, authors, journal, pubDate, doi });
    }
  }
  
  return articles;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subjectId, weekNumber, year } = await req.json();
    
    const { data: subject } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', subjectId)
      .single();
    
    if (!subject) {
      throw new Error('Subject not found');
    }

    // Get all journals for this subject (including interdisciplinary ones)
    const { data: journalRelations } = await supabase
      .from('journal_subjects')
      .select('journal_id, journals(name)')
      .eq('subject_id', subjectId);
    
    // Also get interdisciplinary journals (Science, Nature, Cell)
    const { data: interdisciplinaryJournals } = await supabase
      .from('journals')
      .select('name')
      .eq('is_interdisciplinary', true);

    const journalNames = [
      ...(journalRelations?.map((rel: any) => rel.journals?.name).filter(Boolean) || []),
      ...(interdisciplinaryJournals?.map((j: any) => j.name).filter(Boolean) || [])
    ];

    console.log(`Found ${journalNames.length} journals for ${subject.name}`);

    const startDate = new Date(year, 0, (weekNumber - 1) * 7 + 1);
    const endDate = new Date(year, 0, weekNumber * 7);
    const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '/');
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '/');
    
    // Build search query with subject and journals
    const journalQuery = journalNames.map(name => `"${name}"[Journal]`).join(' OR ');
    const searchQuery = `${subject.name} AND (${journalQuery})`;
    
    console.log(`Searching PubMed for ${subject.name} papers from ${startDateStr} to ${endDateStr}`);
    
    const articles = await searchPubMed(searchQuery, startDateStr, endDateStr);
    
    console.log(`Found ${articles.length} papers, sending to AI for selection...`);
    
    // Use AI to select 1-5 most compelling papers
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiPrompt = `You are a science editor curating papers for a general audience blog post about ${subject.name}.

Review these ${articles.length} research paper abstracts and select 1-5 papers that would make the most compelling story together.

Consider:
- Complementary or contrasting findings that create narrative tension
- Scientific significance and novelty
- Public interest and accessibility
- Papers that together tell a cohesive story

Return ONLY a JSON array of the selected paper PMIDs (the pmid field). Example format:
["12345678", "87654321", "11223344"]

Here are the papers:
${articles.map((a, i) => `
Paper ${i + 1}:
PMID: ${a.pmid}
Title: ${a.title}
Journal: ${a.journal}
Authors: ${a.authors}
Abstract: ${a.abstract}
---`).join('\n')}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI selection error:', aiResponse.status, errorText);
      throw new Error('AI selection failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    // Extract JSON array from AI response
    const jsonMatch = aiContent.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.error('AI response format error:', aiContent);
      throw new Error('AI did not return valid JSON');
    }
    
    const selectedPmids = JSON.parse(jsonMatch[0]) as string[];
    console.log(`AI selected ${selectedPmids.length} papers:`, selectedPmids);
    
    // Filter articles to only include AI-selected ones
    const aiSelectedArticles = articles.filter(a => selectedPmids.includes(a.pmid));
    
    if (aiSelectedArticles.length === 0) {
      throw new Error('No papers matched AI selection');
    }

    const selectedPapers = aiSelectedArticles.map(article => ({
      subject_id: subjectId,
      week_number: weekNumber,
      year,
      article_title: article.title,
      authors: article.authors,
      journal_name: article.journal,
      publication_date: article.pubDate ? `${article.pubDate}-01-01` : null,
      abstract: article.abstract,
      doi: article.doi,
      pubmed_id: article.pmid,
      status: 'pending_pdf'
    }));

    const { data, error } = await supabase
      .from('selected_papers')
      .insert(selectedPapers)
      .select();

    if (error) throw error;

    console.log(`Successfully selected ${data.length} papers for ${subject.name}`);

    return new Response(
      JSON.stringify({ success: true, papersSelected: data.length, papers: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in select-papers function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
