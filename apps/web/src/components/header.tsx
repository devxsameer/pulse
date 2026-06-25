import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { PageContainer } from "./layout/page-container";

export function Header() {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
      <PageContainer className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h4l2-6 4 12 2-6h6" />
            </svg>
          </div>

          <span className="text-lg font-semibold tracking-tight">Pulse</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/features"
            activeProps={{
              className: "text-foreground",
            }}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Features
          </Link>

          <Link
            to="/pricing"
            activeProps={{
              className: "text-foreground",
            }}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Pricing
          </Link>

          <Link
            to="/docs"
            activeProps={{
              className: "text-foreground",
            }}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          <Button asChild variant="ghost">
            <Link to="/login">Log in</Link>
          </Button>

          <Button asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </PageContainer>
    </header>
  );
}
