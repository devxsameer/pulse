import { Outlet } from "@tanstack/react-router";

import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

export function AppShell() {
  return (
    <div className="bg-muted/20 min-h-screen">
      <AppSidebar />

      <div className="lg:pl-64">
        <AppTopbar />

        <main className="min-h-[calc(100vh-4rem)]">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
