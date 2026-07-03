import { LogOut, Menu, Settings, User } from "lucide-react";

import { Link } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "#/components/ui/sheet";

import { useAuth } from "#/features/auth/client/auth.hooks";
import { useLogout } from "#/features/auth/client/auth.mutations";

import { ModeToggle } from "#/app/layouts/mode-toggle";

import { MobileSidebar } from "./mobile-sidebar";

export function AppTopbar() {
  const { data: session } = useAuth();
  const logout = useLogout();

  const user = session?.user;

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center border-b backdrop-blur-xl">
      <div className="flex w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />

              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarImage
                    src={user?.image ?? undefined}
                    alt={user?.name ?? "User"}
                  />

                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>

                <span className="hidden max-w-36 truncate text-sm sm:block">
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm leading-none font-medium">
                    {user?.name}
                  </p>

                  <p className="text-muted-foreground truncate text-xs leading-none">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <User className="size-4" />
                  Account
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                disabled={logout.isPending}
                onSelect={() => logout.mutate()}
              >
                <LogOut className="size-4" />

                {logout.isPending ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function getInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
