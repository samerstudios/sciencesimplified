import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PubMedArticle {
  title: string;
  authors: string;
  abstract: string;
  journal: string;
  pubDate: string;
  doi: string;
  pubmedId: string;
}

async function searchPubMed(subject: string, startDate: string, endDate: string): Promise<PubMedArticle[]> {
  const query = encodeURIComponent(`${subject}[Title/Abstract] AND ${startDate}:${endDate}[Date - Publication]`);
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=100&sort=relevance`;
  
  const searchResponse = await fetch(searchUrl);
  const searchXml = await searchResponse.text();
  
  const idMatches = searchXml.match(/<Id>(\d+)<\/Id>/g);
  if (!idMatches || idMatches.length === 0) {
    return [];
  }
  
  const ids = idMatches.map(match => match.replace(/<\/?Id>/g, '')).join(',');
  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids}&retmode=xml`;
  
  const fetchResponse = await fetch(fetchUrl);
  const fetchXml = await fetchResponse.text();
  
  return parsePubMedXML(fetchXml);
}

function parsePubMedXML(xml: string): PubMedArticle[] {
  const articles: PubMedArticle[] = [];
  const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g);
  
  if (!articleMatches) return articles;
  
  for (const articleXml of articleMatches) {
    const title = articleXml.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1] || '';
    const abstractMatch = articleXml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/)?.[1] || '';
    const journal = articleXml.match(/<Title>([\s\S]*?)<\/Title>/)?.[1] || '';
    const pubDate = articleXml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>[\s\S]*?<\/PubDate>/)?.[1] || '';
    const pubmedId = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] || '';
    
    let doi = '';
    const articleIdMatches = articleXml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
    if (articleIdMatches) {
      doi = articleIdMatches[1];
    }
    
    const authorMatches = articleXml.match(/<Author[^>]*>[\s\S]*?<\/Author>/g);
    let authors = '';
    if (authorMatches) {
      const authorNames = authorMatches.slice(0, 3).map(authorXml => {
        const lastName = authorXml.match(/<LastName>([^<]+)<\/LastName>/)?.[1] || '';
        const initials = authorXml.match(/<Initials>([^<]+)<\/Initials>/)?.[1] || '';
        return `${lastName} ${initials}`;
      });
      authors = authorNames.join(', ');
      if (authorMatches.length > 3) {
        authors += ' et al.';
      }
    }
    
    if (title && abstractMatch && journal) {
      articles.push({
        title,
        authors,
        abstract: abstractMatch,
        journal,
        pubDate,
        doi,
        pubmedId
      });
    }
  }
  
  return articles;
}

function getWeekDateRange(weeksAgo: number): { startDate: string; endDate: string; weekNumber: number; year: number } {
  const now = new Date();
  const currentDay = now.getDay();
  const daysToLastSunday = currentDay === 0 ? 0 : currentDay;
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - daysToLastSunday - (weeksAgo * 7));
  lastSunday.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(lastSunday);
  weekStart.setDate(lastSunday.getDate() - 6);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };
  
  const weekNumber = Math.ceil((lastSunday.getDate() + new Date(lastSunday.getFullYear(), lastSunday.getMonth(), 1).getDay()) / 7);
  
  return {
    startDate: formatDate(weekStart),
    endDate: formatDate(lastSunday),
    weekNumber,
    year: lastSunday.getFullYear()
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting batch paper selection for last 6 weeks...');

    // Get all subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name');

    if (subjectsError) throw subjectsError;
    if (!subjects || subjects.length === 0) {
      throw new Error('No subjects found');
    }

    console.log(`Found ${subjects.length} subjects`);

    const results = [];

    // Process each week
    for (let weeksAgo = 1; weeksAgo <= 6; weeksAgo++) {
      const { startDate, endDate, weekNumber, year } = getWeekDateRange(weeksAgo);
      console.log(`Processing week ${weeksAgo}: ${startDate} to ${endDate} (Week ${weekNumber}, ${year})`);

      // Process each subject for this week
      for (const subject of subjects) {
        try {
          console.log(`Selecting paper for ${subject.name}...`);

          // Get relevant journals for this subject
          const { data: journalData, error: journalError } = await supabase
            .from('journal_subjects')
            .select('journals(name)')
            .eq('subject_id', subject.id);

          if (journalError) throw journalError;

          const relevantJournals = journalData?.map((j: any) => j.journals.name) || [];
          
          // Fetch articles
          const articles = await searchPubMed(subject.name, startDate, endDate);
          console.log(`Found ${articles.length} articles for ${subject.name}`);

          if (articles.length === 0) {
            console.log(`No articles found for ${subject.name} in week ${weekNumber}`);
            continue;
          }

          // Use AI to select the best paper
          const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
          const aiResponse = await fetch('https://api.lovable.app/v1/ai-generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'openai/gpt-5',
              messages: [{
                role: 'user',
                content: `You are a science editor selecting the single most important and exciting research paper from the following list for the subject "${subject.name}".

Relevant high-impact journals for this field: ${relevantJournals.join(', ')}

Selection criteria:
1. Groundbreaking discoveries or significant advances
2. Published in prestigious journals (especially those listed above)
3. Clear real-world implications
4. Novel methodologies or unexpected findings
5. Potential to change current understanding

Articles:
${articles.map((a, i) => `
${i + 1}. ${a.title}
Authors: ${a.authors}
Journal: ${a.journal}
Abstract: ${a.abstract}
DOI: ${a.doi}
PubMed ID: ${a.pubmedId}
`).join('\n')}

Return ONLY a JSON object with this structure:
{
  "selectedIndex": <number>,
  "reasoning": "<brief explanation>"
}

The selectedIndex should be the number (1-based) of the chosen article.`
              }]
            })
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            throw new Error(`AI API error: ${errorText}`);
          }

          const aiData = await aiResponse.json();
          const aiContent = aiData.choices[0].message.content;
          const selection = JSON.parse(aiContent);
          const selectedArticle = articles[selection.selectedIndex - 1];

          console.log(`Selected article: ${selectedArticle.title}`);

          // Store the selected paper
          const { error: insertError } = await supabase
            .from('selected_papers')
            .insert({
              subject_id: subject.id,
              article_title: selectedArticle.title,
              authors: selectedArticle.authors,
              journal_name: selectedArticle.journal,
              abstract: selectedArticle.abstract,
              doi: selectedArticle.doi,
              pubmed_id: selectedArticle.pubmedId,
              publication_date: selectedArticle.pubDate ? `${selectedArticle.pubDate}-01-01` : null,
              week_number: weekNumber,
              year: year,
              status: 'pending_pdf',
              quality_score: null
            });

          if (insertError) {
            console.error(`Error inserting paper for ${subject.name}:`, insertError);
          } else {
            results.push({
              subject: subject.name,
              week: weekNumber,
              year: year,
              article: selectedArticle.title
            });
          }

        } catch (error) {
          console.error(`Error processing ${subject.name} for week ${weekNumber}:`, error);
        }
      }
    }

    console.log(`Batch processing complete. Selected ${results.length} papers.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully selected ${results.length} papers across 6 weeks`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch-select-papers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
