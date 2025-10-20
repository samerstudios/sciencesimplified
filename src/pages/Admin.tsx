import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, CheckCircle, Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Admin = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchSelecting, setIsBatchSelecting] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [pendingPapers, setPendingPapers] = useState<any[]>([]);
  const [readyPapers, setReadyPapers] = useState<any[]>([]);
  const [draftPosts, setDraftPosts] = useState<any[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<any[]>([]);
  const [publishingPosts, setPublishingPosts] = useState<Set<string>>(new Set());
  const [uploadingPapers, setUploadingPapers] = useState<Set<string>>(new Set());
  const [previewPost, setPreviewPost] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchPendingPapers();
    fetchDraftPosts();
    fetchPublishedPosts();
  }, []);

  const fetchSubjects = async () => {
    const { data } = await supabase
      .from("subjects")
      .select("id, name")
      .order("name");
    
    if (data) setSubjects(data);
  };

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

  const fetchPublishedPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("publish_date", { ascending: false });
    
    if (data) setPublishedPosts(data);
  };

  const handleClearAllPosts = async () => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

      if (error) throw error;

      toast({
        title: "All posts deleted",
        description: "All blog posts have been removed from the database",
      });

      await fetchDraftPosts();
      await fetchPublishedPosts();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (paperId: string, file: File) => {
    // Check file size (100MB limit for storage)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `PDF size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 100MB limit. Please use a smaller file.`,
        variant: "destructive",
      });
      return;
    }

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

  const handleDeletePendingPaper = async (paperId: string) => {
    try {
      const { error } = await supabase
        .from("selected_papers")
        .delete()
        .eq("id", paperId);

      if (error) throw error;

      // Immediately update the UI by filtering out the deleted paper
      setPendingPapers(prev => prev.filter(paper => paper.id !== paperId));
      setSelectedPapers(prev => prev.filter(id => id !== paperId));

      toast({
        title: "Paper deleted",
        description: "Paper removed from pending uploads",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllPendingPapers = async () => {
    try {
      const { error } = await supabase
        .from("selected_papers")
        .delete()
        .eq("status", "pending_pdf");

      if (error) throw error;

      // Immediately update the UI by clearing all pending papers
      setPendingPapers([]);
      setSelectedPapers([]);

      toast({
        title: "All pending papers deleted",
        description: "All papers removed from pending uploads",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeletePdf = async (paperId: string, pdfPath: string) => {
    try {
      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from("research-pdfs")
        .remove([pdfPath]);

      if (deleteError) throw deleteError;

      // Update the paper status back to pending_pdf
      const { error: updateError } = await supabase
        .from("selected_papers")
        .update({
          pdf_storage_path: null,
          status: "pending_pdf"
        })
        .eq("id", paperId);

      if (updateError) throw updateError;

      // Immediately update the UI
      const movedPaper = readyPapers.find(p => p.id === paperId);
      if (movedPaper) {
        setReadyPapers(prev => prev.filter(p => p.id !== paperId));
        setPendingPapers(prev => [...prev, { ...movedPaper, status: "pending_pdf", pdf_storage_path: null }]);
        setSelectedPapers(prev => [...prev, paperId]);
      }

      toast({
        title: "PDF deleted successfully",
        description: "Paper moved back to pending uploads",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleBatchSelectPapers = async () => {
    setIsBatchSelecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("batch-select-papers");

      if (error) throw error;

      toast({
        title: "Batch selection complete!",
        description: data.message,
      });

      await fetchPendingPapers();
    } catch (error) {
      console.error("Error in batch selection:", error);
      toast({
        title: "Batch selection failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsBatchSelecting(false);
    }
  };

  const handleSelectPapers = async () => {
    if (selectedSubjects.length === 0) {
      toast({ title: "Please select at least one subject", variant: "destructive" });
      return;
    }

    setIsSelecting(true);
    let totalPapersSelected = 0;
    const allErrors: string[] = [];
    
    try {
      // Process each subject sequentially
      for (const subjectName of selectedSubjects) {
        try {
          const { data: subjectData } = await supabase
            .from("subjects")
            .select("id")
            .eq("name", subjectName)
            .single();

          if (!subjectData) {
            allErrors.push(`${subjectName}: Subject not found`);
            continue;
          }

          const { data, error } = await supabase.functions.invoke("select-papers", {
            body: {
              subjectId: subjectData.id,
            },
          });

          if (error) {
            allErrors.push(`${subjectName}: ${error.message}`);
            continue;
          }

          totalPapersSelected += data.papersSelected || 0;
          setSelectedPapers(prev => [...prev, ...data.papers.map((p: any) => p.id)]);
        } catch (error) {
          allErrors.push(`${subjectName}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }

      // Show results
      if (totalPapersSelected > 0) {
        toast({
          title: "Papers selected!",
          description: `Found ${totalPapersSelected} papers across ${selectedSubjects.length} subjects`,
        });
      }

      if (allErrors.length > 0) {
        toast({
          title: "Some subjects had errors",
          description: allErrors.join(", "),
          variant: "destructive",
        });
      }

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
      await fetchPublishedPosts();
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

  const handlePublishAll = async () => {
    if (draftPosts.length === 0) return;

    const publishDate = new Date().toISOString();
    const postIds = draftPosts.map(p => p.id);

    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          status: "published",
          publish_date: publishDate
        })
        .in("id", postIds);

      if (error) throw error;

      toast({
        title: "All posts published!",
        description: `${draftPosts.length} blog posts are now live`,
      });

      await fetchDraftPosts();
      await fetchPublishedPosts();
    } catch (error) {
      console.error("Publish all error:", error);
      toast({
        title: "Publish failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
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

        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Batch Process Last 6 Weeks</CardTitle>
            <CardDescription>
              Automatically select papers from the last 6 Sundays for all subjects. This will run the paper selection pipeline for each week and subject, then you can manually upload PDFs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleBatchSelectPapers}
              disabled={isBatchSelecting}
              className="w-full"
              size="lg"
            >
              {isBatchSelecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBatchSelecting ? "Processing... (this may take several minutes)" : "Select Papers from Last 6 Weeks"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Papers</CardTitle>
            <CardDescription>
              Choose one or more subjects to fetch the latest research papers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Subjects ({selectedSubjects.length})</Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                {selectedSubjects.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No subjects selected</span>
                ) : (
                  selectedSubjects.map((subject) => (
                    <div key={subject} className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {subject}
                      <button
                        onClick={() => setSelectedSubjects(prev => prev.filter(s => s !== subject))}
                        className="hover:bg-primary/80 rounded-full"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (value && !selectedSubjects.includes(value)) {
                    setSelectedSubjects(prev => [...prev, value]);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a subject" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {subjects
                    .filter(subject => !selectedSubjects.includes(subject.name))
                    .map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => setSelectedSubjects(subjects.map(s => s.name))}
                disabled={selectedSubjects.length === subjects.length}
                variant="outline"
              >
                Add All
              </Button>
            </div>

            <Button
              onClick={handleSelectPapers}
              disabled={isSelecting || selectedSubjects.length === 0}
              className="w-full"
            >
              {isSelecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSelecting ? "Selecting Papers..." : `Select Papers from PubMed (${selectedSubjects.length} ${selectedSubjects.length === 1 ? 'subject' : 'subjects'})`}
            </Button>
          </CardContent>
        </Card>

        {pendingPapers.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upload PDFs</CardTitle>
                  <CardDescription>
                    {pendingPapers.length} papers waiting for PDF upload
                  </CardDescription>
                </div>
                <Button
                  onClick={handleDeleteAllPendingPapers}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingPapers.map((paper) => (
                <div key={paper.id} className="p-4 border rounded-lg space-y-2">
                  <div>
                    <h3 
                      className="font-semibold text-sm"
                      dangerouslySetInnerHTML={{ __html: paper.article_title }}
                    />
                    <p className="text-xs text-muted-foreground">{paper.journal_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`file-${paper.id}`} className="cursor-pointer flex-1">
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
                        className="w-full"
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
                    <Button
                      onClick={() => handleDeletePendingPaper(paper.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {readyPapers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Papers with PDFs</CardTitle>
              <CardDescription>
                {readyPapers.length} papers ready with PDFs uploaded
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {readyPapers.map((paper) => (
                <div key={paper.id} className="p-4 border rounded-lg space-y-2">
                  <div>
                    <h3 
                      className="font-semibold text-sm"
                      dangerouslySetInnerHTML={{ __html: paper.article_title }}
                    />
                    <p className="text-xs text-muted-foreground">{paper.journal_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-xs text-green-600">PDF uploaded</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeletePdf(paper.id, paper.pdf_storage_path)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete PDF
                  </Button>
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
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Draft Posts</CardTitle>
                  <CardDescription>
                    {draftPosts.length} draft blog posts ready to publish
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePublishAll}
                    variant="default"
                    size="sm"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Publish All
                  </Button>
                  <Button
                    onClick={handleClearAllPosts}
                    variant="destructive"
                    size="sm"
                  >
                    Clear All Posts
                  </Button>
                </div>
              </div>
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
                        try {
                          const { error } = await supabase
                            .from("blog_posts")
                            .delete()
                            .eq("id", post.id);

                          if (error) throw error;

                          toast({
                            title: "Post deleted",
                            description: "The blog post has been removed",
                          });

                          await fetchDraftPosts();
                          await fetchPublishedPosts();
                        } catch (error) {
                          console.error("Delete error:", error);
                          toast({
                            title: "Delete failed",
                            description: error instanceof Error ? error.message : "Unknown error",
                            variant: "destructive",
                          });
                        }
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
                          await fetchPublishedPosts();
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

        {publishedPosts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Published Posts</CardTitle>
              <CardDescription>
                {publishedPosts.length} published blog posts on the site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {publishedPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg space-y-3">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">{post.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-2">{post.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Published: {new Date(post.publish_date).toLocaleDateString()} • {post.read_time} min read
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
                        try {
                          const { error } = await supabase
                            .from("blog_posts")
                            .update({ status: "draft", publish_date: null })
                            .eq("id", post.id);

                          if (error) throw error;

                          toast({
                            title: "Post unpublished",
                            description: "The post has been moved back to drafts",
                          });

                          await fetchDraftPosts();
                          await fetchPublishedPosts();
                        } catch (error) {
                          console.error("Unpublish error:", error);
                          toast({
                            title: "Unpublish failed",
                            description: error instanceof Error ? error.message : "Unknown error",
                            variant: "destructive",
                          });
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Unpublish
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from("blog_posts")
                            .delete()
                            .eq("id", post.id);

                          if (error) throw error;

                          toast({
                            title: "Post deleted",
                            description: "The blog post has been removed",
                          });

                          await fetchPublishedPosts();
                        } catch (error) {
                          console.error("Delete error:", error);
                          toast({
                            title: "Delete failed",
                            description: error instanceof Error ? error.message : "Unknown error",
                            variant: "destructive",
                          });
                        }
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
