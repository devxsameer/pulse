import { ArrowRight, Bot, Sparkles, TrendingUp } from "lucide-react";

import { Link } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";

export function AiInsightCard() {
  return (
    <div className="bg-card relative overflow-hidden rounded-xl border">
      <div className="bg-primary/10 absolute -top-24 -right-24 size-64 rounded-full blur-3xl" />

      <div className="relative border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl">
            <Bot className="size-4" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold tracking-tight">Pulse AI</h2>

              <Sparkles className="text-primary size-3.5" />
            </div>

            <p className="text-muted-foreground mt-0.5 text-xs">
              Latest insight
            </p>
          </div>
        </div>
      </div>

      <div className="relative p-5">
        <div className="border-primary/20 bg-primary/5 rounded-xl border p-4">
          <div className="text-primary flex items-center gap-2 text-xs font-medium">
            <TrendingUp className="size-3.5" />
            Traffic opportunity
          </div>

          <p className="mt-3 text-sm leading-6 font-medium">
            Your GitHub traffic is converting 2.4x better than direct traffic.
          </p>

          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Links shared in developer communities generated 38% of your
            highest-quality visitors this week.
          </p>
        </div>

        <div className="mt-5">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Recommendation
          </p>

          <p className="mt-2 text-sm leading-6">
            Increase distribution across GitHub repositories and developer
            communities.
          </p>
        </div>

        <Button variant="ghost" className="mt-5 w-full justify-between" asChild>
          <Link to="/ai-insights">
            View all insights
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
