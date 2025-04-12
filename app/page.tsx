import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Metadata } from "next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const metadata: Metadata = {
  title: "FinSearch - AI-Powered Financial Research Platform",
  description:
    "Discover FinSearch - Your AI-powered financial research companion for earnings call analysis, document chat, and risk factor analysis.",
  openGraph: {
    title: "FinSearch - AI-Powered Financial Research Platform",
    description:
      "Your AI-powered financial research companion for earnings call analysis, document chat, and risk factor analysis.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="max-w-2xl space-y-6">
        <Badge
          variant="outline"
          className="mb-4 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-300/50 text-blue-700 dark:text-blue-300 animate-pulse"
        >
          Beta v0.1
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          FinSearch
        </h1>
        <p className="text-lg text-muted-foreground">
          Your AI-powered financial research companion. We&apos;re starting with
          earnings call analysis, with document chat, risk factor analysis, and
          more features on the horizon.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/DODLA/concall">
            <Button size="lg">Explore Platform</Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                Get in Touch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact Us</DialogTitle>
                <DialogDescription className="pt-4">
                  Have feedback, bug reports, or feature requests? We&apos;d
                  love to hear from you. Reach out to us at{" "}
                  <a
                    href="mailto:skdcodes@gmail.com"
                    className="text-primary hover:underline"
                  >
                    sai@industrodrome.com
                  </a>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
