import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageContainer } from "#/components/layouts/page-container";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "#/features/auth/client/auth.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useLogout } from "#/features/auth/client/auth.mutations";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

export function Header() {
  const { data } = useAuth();
  const logoutMutation = useLogout();
  const user = data?.user;
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
            to="/"
            activeProps={{
              className: "text-foreground",
            }}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Features
          </Link>

          <Link
            to="/"
            activeProps={{
              className: "text-foreground",
            }}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Pricing
          </Link>

          <Link
            to="/"
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-0"
                >
                  <Avatar>
                    <AvatarImage src={user.image ?? ""} alt={`@${user.name}`} />
                    <AvatarFallback>
                      {user.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuItem>
                    <User /> Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      toast.promise(logoutMutation.mutateAsync(), {
                        loading: "Logging out...",
                        success: "Logged out successfully",
                      })
                    }
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut />
                    {logoutMutation.isPending ? "Logging Out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>

              <Button asChild size="sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </PageContainer>
    </header>
  );
}
