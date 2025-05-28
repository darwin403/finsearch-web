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

export function FeedbackForm() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "positive" | "negative" | null
  >(null);

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
    } catch (error) {
      console.error("Error sending feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 flex gap-2 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => {
            setFeedbackType("positive");
            setIsOpen(true);
          }}
        >
          <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => {
            setFeedbackType("negative");
            setIsOpen(true);
          }}
        >
          <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
