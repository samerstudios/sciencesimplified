import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Send } from "lucide-react";

export const NewsletterAdmin = () => {
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchSubscriberCount = async () => {
    const { count } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    
    setSubscriberCount(count || 0);
  };

  const handleSendNewsletter = async (isTest: boolean) => {
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: {
          testEmail: isTest ? testEmail : undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Newsletter sent!",
        description: isTest 
          ? `Test newsletter sent to ${testEmail}`
          : `Newsletter sent to ${data.recipientCount} subscribers`,
      });

      if (!isTest) {
        await fetchSubscriberCount();
      }
    } catch (error) {
      console.error("Error sending newsletter:", error);
      toast({
        title: "Failed to send newsletter",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Newsletter Management
        </CardTitle>
        <CardDescription>
          Send newsletters to subscribers with the latest published articles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Button
            onClick={fetchSubscriberCount}
            variant="outline"
            size="sm"
          >
            Refresh Subscriber Count
          </Button>
          {subscriberCount !== null && (
            <p className="text-sm text-muted-foreground mt-2">
              Active subscribers: {subscriberCount}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Send Test Newsletter</h3>
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="your@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleSendNewsletter(true)}
              disabled={isSending || !testEmail}
              className="mt-3"
              variant="outline"
            >
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Test Newsletter
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">Send to All Subscribers</h3>
            <p className="text-sm text-muted-foreground mb-3">
              This will send a newsletter with articles published in the last 7 days to all active subscribers.
            </p>
            <Button
              onClick={() => handleSendNewsletter(false)}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Newsletter...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Newsletter to All
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};