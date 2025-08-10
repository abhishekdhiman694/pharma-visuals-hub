import { Pill, Bone, Baby, Brain, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

const SiteHeader = () => {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 story-link" aria-label="MedVis Home">
          <Pill className="h-5 w-5" />
          <span className="font-semibold tracking-tight">MedVis</span>
        </a>
        <nav className="flex items-center gap-3">
          <a href="#categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse</a>
          <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Admin</a>
          <Button variant="hero" size="sm" asChild>
            <a href="#categories">Start</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
