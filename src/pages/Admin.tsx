import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, CheckCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Admin = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [pendingPapers, setPendingPapers] = useState<any[]>([]);
  const [readyPapers, setReadyPapers] = useState<any[]>([]);
  const [draftPosts, setDraftPosts] = useState<any[]>([]);
  const [publishingPosts, setPublishingPosts] = useState<Set<string>>(new Set());
  const [uploadingPapers, setUploadingPapers] = useState<Set<string>>(new Set());
  const [previewPost, setPreviewPost] = useState<any>(null);
  const { toast } = useToast();

  const subjects = [
    { id: "neuroscience", name: "Neuroscience" },
    { id: "immunology", name: "Immunology" },
    { id: "cancer", name: "Cancer Research" },
    { id: "genetics", name: "Genetics" },
    { id: "climate", name: "Climate Science" },
  ];

  useEffect(() => {
    fetchPendingPapers();
    fetchDraftPosts();
  }, []);

  const fetchPendingPapers = async () => {
    const { data: pending } = await supabase
      .from("selected_papers")
      .select("*")
      .eq("status", "pending_pdf")
      .order("selection_date", { ascending: false });
    
    const { data: ready } = await supabase
      .from("selected_papers")
      .select("*")
      .eq("status", "pdf_uploaded")
      .order("selection_date", { ascending: false });
    
    if (pending) setPendingPapers(pending);
    if (ready) setReadyPapers(ready);
  };

  const fetchDraftPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "draft")
      .order("created_at", { ascending: false });
    
    if (data) setDraftPosts(data);
  };

  const handleFileUpload = async (paperId: string, file: File) => {
    setUploadingPapers(prev => new Set(prev).add(paperId));
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${paperId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("research-pdfs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("selected_papers")
        .update({
          pdf_storage_path: filePath,
          status: "pdf_uploaded"
        })
        .eq("id", paperId);

      if (updateError) throw updateError;

      toast({
        title: "PDF uploaded successfully!",
        description: "Paper is ready for processing",
      });

      fetchPendingPapers();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploadingPapers(prev => {
        const next = new Set(prev);
        next.delete(paperId);
        return next;
      });
    }
  };

  const handleSelectPapers = async () => {
    if (!selectedSubject) {
      toast({ title: "Please select a subject", variant: "destructive" });
      return;
    }

    setIsSelecting(true);
    try {
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", selectedSubject)
        .single();

      if (!subjectData) {
        throw new Error("Subject not found");
      }

      const now = new Date();
      const weekNumber = Math.ceil(now.getDate() / 7);
      const year = now.getFullYear();

      const { data, error } = await supabase.functions.invoke("select-papers", {
        body: {
          subjectId: subjectData.id,
          weekNumber,
          year,
        },
      });

      if (error) throw error;

      setSelectedPapers(data.papers.map((p: any) => p.id));
      toast({
        title: "Papers selected!",
        description: `Found ${data.papersSelected} papers for ${selectedSubject}`,
      });
      await fetchPendingPapers();
    } catch (error) {
      console.error("Error selecting papers:", error);
      toast({
        title: "Error selecting papers",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSelecting(false);
    }
  };

  const handleGenerateBlog = async () => {
    const papersToProcess = readyPapers.length > 0 ? readyPapers.map(p => p.id) : selectedPapers;
    
    if (papersToProcess.length === 0) {
      toast({ title: "No papers ready", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const subjectId = readyPapers.length > 0 ? readyPapers[0].subject_id : null;

      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: {
          paperIds: papersToProcess,
          subjectId: subjectId,
        },
      });

      if (error) throw error;

      toast({
        title: "Blog post generated!",
        description: "Check the Draft Posts section below to review and publish",
      });

      setSelectedPapers([]);
      setReadyPapers([]);
      await fetchPendingPapers();
      await fetchDraftPosts();
    } catch (error) {
      console.error("Error generating blog:", error);
      toast({
        title: "Error generating blog",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage paper selection and blog post generation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Papers</CardTitle>
            <CardDescription>
              Choose a subject to fetch the latest research papers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSelectPapers}
              disabled={isSelecting || !selectedSubject}
              className="w-full"
            >
              {isSelecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSelecting ? "Selecting Papers..." : "Select Papers from PubMed"}
            </Button>
          </CardContent>
        </Card>

        {pendingPapers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload PDFs</CardTitle>
              <CardDescription>
                {pendingPapers.length} papers waiting for PDF upload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingPapers.map((paper) => (
                <div key={paper.id} className="p-4 border rounded-lg space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm">{paper.article_title}</h3>
                    <p className="text-xs text-muted-foreground">{paper.journal_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`file-${paper.id}`} className="cursor-pointer">
                      <Input
                        id={`file-${paper.id}`}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(paper.id, file);
                        }}
                        disabled={uploadingPapers.has(paper.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadingPapers.has(paper.id)}
                        asChild
                      >
                        <span>
                          {uploadingPapers.has(paper.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {uploadingPapers.has(paper.id) ? "Uploading..." : "Upload PDF"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {(selectedPapers.length > 0 || readyPapers.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Blog Post</CardTitle>
              <CardDescription>
                {readyPapers.length > 0 
                  ? `${readyPapers.length} papers ready with PDFs uploaded`
                  : `${selectedPapers.length} papers selected and ready for content generation`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGenerateBlog}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? "Generating..." : "Generate Blog Post with AI"}
              </Button>
            </CardContent>
          </Card>
        )}

        {draftPosts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Draft Posts</CardTitle>
              <CardDescription>
                {draftPosts.length} draft blog posts ready to publish
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {draftPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg space-y-3">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">{post.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-2">{post.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(post.created_at).toLocaleDateString()} • {post.read_time} min read
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPreviewPost(post)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      onClick={async () => {
                        setPublishingPosts(prev => new Set(prev).add(post.id));
                        try {
                          const { error } = await supabase
                            .from("blog_posts")
                            .update({ 
                              status: "published",
                              publish_date: new Date().toISOString()
                            })
                            .eq("id", post.id);

                          if (error) throw error;

                          toast({
                            title: "Post published!",
                            description: "The blog post is now live on the home page",
                          });

                          await fetchDraftPosts();
                        } catch (error) {
                          console.error("Publish error:", error);
                          toast({
                            title: "Publish failed",
                            description: error instanceof Error ? error.message : "Unknown error",
                            variant: "destructive",
                          });
                        } finally {
                          setPublishingPosts(prev => {
                            const next = new Set(prev);
                            next.delete(post.id);
                            return next;
                          });
                        }
                      }}
                      disabled={publishingPosts.has(post.id)}
                      size="sm"
                      className="flex-1"
                    >
                      {publishingPosts.has(post.id) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Publish
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewPost?.title}</DialogTitle>
            <DialogDescription>{previewPost?.subtitle}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: previewPost?.content || '' }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
