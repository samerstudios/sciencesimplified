import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const { toast } = useToast();

  const subjects = [
    { id: "neuroscience", name: "Neuroscience" },
    { id: "immunology", name: "Immunology" },
    { id: "cancer", name: "Cancer Research" },
    { id: "genetics", name: "Genetics" },
    { id: "climate", name: "Climate Science" },
  ];

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
    if (selectedPapers.length === 0) {
      toast({ title: "No papers selected", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", selectedSubject)
        .single();

      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: {
          paperIds: selectedPapers,
          subjectId: subjectData?.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Blog post generated!",
        description: "Draft created successfully",
      });

      setSelectedPapers([]);
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

        {selectedPapers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Blog Post</CardTitle>
              <CardDescription>
                {selectedPapers.length} papers selected and ready for content generation
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
      </div>
    </div>
  );
};

export default Admin;
