import { Outlet } from "@tanstack/react-router";
import { PageContainer } from "#/components/layouts/page-container";
import { ArrowRight } from "lucide-react";

function GridBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[40px_40px] opacity-30" />

      <div className="from-background/20 to-background absolute inset-0 bg-linear-to-br via-transparent" />

      <div className="bg-primary/10 absolute top-1/2 left-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
    </>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <ArrowRight className="text-primary h-4 w-4" />
      </div>

      <div>
        <h3 className="font-medium">{title}</h3>

        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default function AuthLayout() {
  return (
    <PageContainer className="flex min-h-[calc(100vh-4rem)] items-center py-10">
      <div className="bg-background grid w-full overflow-hidden rounded-3xl border shadow-xl lg:grid-cols-2">
        {/* Left */}

        <div className="flex items-center justify-center p-8 lg:p-14">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Right */}

        <aside className="bg-muted/30 relative hidden overflow-hidden border-l lg:flex">
          <GridBackground />

          <div className="relative z-10 flex flex-1 flex-col justify-between p-14">
            <div>
              <div className="bg-primary text-primary-foreground mb-8 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold">
                P
              </div>

              <h2 className="text-4xl font-bold tracking-tight">Pulse</h2>

              <p className="text-muted-foreground mt-4 max-w-md text-lg">
                Intelligent link management powered by analytics and AI.
              </p>
            </div>

            <div className="space-y-5">
              <Feature
                title="Smart Short Links"
                description="Custom aliases, QR codes and branded links."
              />

              <Feature
                title="Real-time Analytics"
                description="Track every click across devices, countries and campaigns."
              />

              <Feature
                title="AI Insights"
                description="Automatically discover trends and optimize performance."
              />
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
