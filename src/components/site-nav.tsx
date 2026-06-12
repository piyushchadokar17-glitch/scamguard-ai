import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <Shield className="h-6 w-6" strokeWidth={2.5} />
          <span>Scam Shield</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary [&.active]:font-semibold"
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link
            to="/analyze"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary [&.active]:font-semibold"
          >
            Analyze
          </Link>
          <Link
            to="/community"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary [&.active]:font-semibold"
          >
            Community
          </Link>
        </nav>
        <Button asChild size="sm">
          <Link to="/analyze">Analyze Now</Link>
        </Button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-2 font-display font-semibold text-foreground">
          <Shield className="h-4 w-4 text-primary" />
          Scam Shield
        </div>
        <p>© {new Date().getFullYear()} AI Academic Scam Shield · Don't Get Played. Get It Checked.</p>
      </div>
    </footer>
  );
}
