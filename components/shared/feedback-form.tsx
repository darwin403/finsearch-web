"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useToast } from "@/components/ui/use-toast";

export function FeedbackForm() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "positive" | "negative" | null
  >(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        {
          feedback_type: feedbackType,
          feedback_message: feedback,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""
      );
      setFeedback("");
      setIsOpen(false);
      toast({
        description:
          "Thank you! We've received your feedback and will try to fix it as soon as possible.",
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => {
            setFeedbackType("positive");
            setIsOpen(true);
          }}
        >
          <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => {
            setFeedbackType("negative");
            setIsOpen(true);
          }}
        >
          <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] mx-4">
          <DialogHeader>
            <DialogTitle>
              {feedbackType === "positive"
                ? "What did you like?"
                : "What could be better?"}
            </DialogTitle>
            <DialogDescription>
              Your feedback helps us improve ArthaLens for everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Share your thoughts..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim() || isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
