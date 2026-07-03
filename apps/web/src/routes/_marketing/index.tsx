import { Button } from "#/components/ui/button";
import { useAuth } from "#/features/auth/client/auth.hooks";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Globe2,
  Link2,
  MousePointerClick,
  QrCode,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/_marketing/")({
  validateSearch: z.object({
    loginSuccess: z.boolean().optional(),
  }),
  component: HomePage,
});

function HomePage() {
  const { data: session } = useAuth();

  const { loginSuccess } = Route.useSearch();
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!loginSuccess) return;

    toast.success("Welcome to Pulse", {
      description: "You have logged in successfully.",
    });

    navigate({
      search: {},
      replace: true,
    });
  }, [loginSuccess, navigate]);

  return (
    <>
      <HeroSection isAuthenticated={Boolean(session)} />

      <TrustedSection />

      <FeaturesSection />

      <AiSection />

      <AnalyticsSection />

      <CtaSection isAuthenticated={Boolean(session)} />
    </>
  );
}

function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <HeroGrid />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="border-border bg-background/80 text-muted-foreground mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm shadow-sm backdrop-blur">
          <Sparkles className="text-primary size-3.5" />

          <span>AI-powered link intelligence</span>

          <ArrowRight className="size-3.5" />
        </div>

        <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl md:text-7xl lg:text-8xl">
          Short links.
          <br />
          <span className="text-muted-foreground">Smarter decisions.</span>
        </h1>

        <p className="text-muted-foreground mt-7 max-w-2xl text-lg leading-8 text-balance sm:text-xl">
          Create powerful short links, understand every click, and let AI turn
          your analytics into actionable insights.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          {isAuthenticated ? (
            <>
              <Button size="lg" className="h-11 px-6" asChild>
                <Link to="/dashboard">
                  Go to dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                <Link to="/dashboard">
                  <Link2 className="size-4" />
                  Create a link
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="h-11 px-6" asChild>
                <Link to="/signup">
                  Start for free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                <Link to="/login">Log in</Link>
              </Button>
            </>
          )}
        </div>

        {!isAuthenticated && (
          <p className="text-muted-foreground mt-4 text-xs">
            Free to get started. No credit card required.
          </p>
        )}

        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="relative mt-20 w-full max-w-5xl">
      <div className="bg-primary/15 absolute -inset-10 -z-10 rounded-full blur-3xl" />

      <div className="border-border bg-background overflow-hidden rounded-2xl border shadow-2xl">
        <div className="border-border flex h-11 items-center gap-2 border-b px-4">
          <div className="bg-muted-foreground/30 size-2.5 rounded-full" />
          <div className="bg-muted-foreground/30 size-2.5 rounded-full" />
          <div className="bg-muted-foreground/30 size-2.5 rounded-full" />

          <div className="bg-muted text-muted-foreground mx-auto flex h-6 w-52 items-center justify-center rounded-md text-[10px]">
            pulse.dev/dashboard
          </div>
        </div>

        <div className="grid min-h-112 md:grid-cols-[220px_1fr]">
          <aside className="border-border hidden border-r p-4 md:block">
            <div className="mb-8 flex items-center gap-2 px-2">
              <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
                <Zap className="size-4" />
              </div>

              <span className="text-sm font-semibold">Pulse</span>
            </div>

            <div className="space-y-1">
              <PreviewNavItem active icon={Link2} label="Links" />
              <PreviewNavItem icon={BarChart3} label="Analytics" />
              <PreviewNavItem icon={Bot} label="AI Insights" />
              <PreviewNavItem icon={QrCode} label="QR Codes" />
            </div>
          </aside>

          <div className="p-5 text-left sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-semibold tracking-tight">
                  Your links
                </p>

                <p className="text-muted-foreground mt-1 text-sm">
                  Manage and understand every link.
                </p>
              </div>

              <div className="bg-primary text-primary-foreground flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium">
                <Link2 className="size-3.5" />
                Create link
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              <PreviewLink
                domain="pulse.dev/launch"
                destination="pulse.dev/product/launch"
                clicks="12.4K"
              />

              <PreviewLink
                domain="pulse.dev/github"
                destination="github.com/pulse"
                clicks="8.2K"
              />

              <PreviewLink
                domain="pulse.dev/docs"
                destination="docs.pulse.dev"
                clicks="4.7K"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewNavItem({
  active,
  icon: Icon,
  label,
}: {
  active?: boolean;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div
      className={
        active
          ? "bg-muted text-foreground flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium"
          : "text-muted-foreground flex items-center gap-3 rounded-md px-2.5 py-2 text-xs"
      }
    >
      <Icon className="size-3.5" />
      {label}
    </div>
  );
}

function PreviewLink({
  domain,
  destination,
  clicks,
}: {
  domain: string;
  destination: string;
  clicks: string;
}) {
  return (
    <div className="border-border bg-card flex items-center gap-4 rounded-xl border p-4">
      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Link2 className="text-muted-foreground size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{domain}</p>

        <p className="text-muted-foreground mt-0.5 truncate text-xs">
          {destination}
        </p>
      </div>

      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <MousePointerClick className="size-3.5" />
        {clicks}
      </div>
    </div>
  );
}

function TrustedSection() {
  return (
    <section className="border-border border-y">
      <PageSection className="py-8">
        <p className="text-muted-foreground text-center text-sm">
          Everything you need to turn links into intelligence
        </p>

        <div className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <TrustItem icon={Zap} text="Fast redirects" />
          <TrustItem icon={BarChart3} text="Real-time analytics" />
          <TrustItem icon={Bot} text="AI insights" />
          <TrustItem icon={ShieldCheck} text="Privacy focused" />
        </div>
      </PageSection>
    </section>
  );
}

function TrustItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4" />
      {text}
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32">
      <PageSection>
        <SectionHeading
          eyebrow="Built for modern links"
          title="More than a URL shortener"
          description="Pulse gives every link the infrastructure, analytics, and intelligence it needs."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Link2}
            title="Powerful short links"
            description="Create memorable short links with custom aliases, expiration rules, and flexible destinations."
          />

          <FeatureCard
            icon={BarChart3}
            title="Real-time analytics"
            description="Understand clicks, countries, devices, browsers, referrers, and campaigns as they happen."
          />

          <FeatureCard
            icon={Bot}
            title="AI-powered insights"
            description="Turn raw analytics into summaries, trends, anomalies, and clear recommendations."
          />

          <FeatureCard
            icon={QrCode}
            title="Dynamic QR codes"
            description="Generate QR codes connected to links you can update without replacing the code."
          />

          <FeatureCard
            icon={Globe2}
            title="Smart routing"
            description="Route visitors based on geography, device, language, or campaign conditions."
          />

          <FeatureCard
            icon={ShieldCheck}
            title="Built with control"
            description="Manage link lifecycle, access, abuse protection, and audit-friendly events."
          />
        </div>
      </PageSection>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group border-border bg-card/50 hover:bg-card relative overflow-hidden rounded-2xl border p-6 transition-colors">
      <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
        <Icon className="size-5" />
      </div>

      <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>

      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {description}
      </p>

      <div className="bg-primary/5 absolute -right-16 -bottom-16 size-40 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-150" />
    </div>
  );
}

function AiSection() {
  return (
    <section className="border-border bg-muted/20 border-y py-24 sm:py-32">
      <PageSection>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="text-primary flex items-center gap-2 text-sm font-medium">
              <WandSparkles className="size-4" />
              Pulse AI
            </div>

            <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
              Your analytics should explain themselves.
            </h2>

            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8">
              Stop staring at dashboards. Pulse analyzes link performance and
              tells you what changed, why it matters, and what you should do
              next.
            </p>

            <div className="mt-8 space-y-4">
              <CheckItem text="Summarize campaign performance" />
              <CheckItem text="Detect unusual traffic and click spikes" />
              <CheckItem text="Discover high-performing audiences" />
              <CheckItem text="Get actionable optimization suggestions" />
            </div>
          </div>

          <AiPreview />
        </div>
      </PageSection>
    </section>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 text-primary flex size-5 items-center justify-center rounded-full">
        <Check className="size-3" />
      </div>

      <p className="text-sm">{text}</p>
    </div>
  );
}

function AiPreview() {
  return (
    <div className="border-border bg-background relative rounded-2xl border p-5 shadow-xl sm:p-7">
      <div className="bg-primary/10 absolute -inset-10 -z-10 rounded-full blur-3xl" />

      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl">
          <Bot className="size-4" />
        </div>

        <div>
          <p className="text-sm font-medium">Pulse AI</p>
          <p className="text-muted-foreground text-xs">Campaign analysis</p>
        </div>
      </div>

      <div className="border-border bg-muted/30 mt-6 rounded-xl border p-4">
        <p className="text-sm font-medium">
          Your launch campaign grew 34% this week.
        </p>

        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Most of the growth came from mobile visitors in India. GitHub
          referrals generated 2.4× more conversions than direct traffic.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric value="+34%" label="Clicks" />
        <Metric value="2.4×" label="GitHub" />
        <Metric value="68%" label="Mobile" />
      </div>

      <div className="border-primary/20 bg-primary/5 mt-4 rounded-xl border p-4">
        <div className="text-primary flex items-center gap-2 text-xs font-medium">
          <Sparkles className="size-3.5" />
          Recommendation
        </div>

        <p className="mt-2 text-sm leading-6">
          Optimize your landing page for mobile and invest more in GitHub
          community campaigns.
        </p>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-border rounded-xl border p-3">
      <p className="font-semibold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <section className="py-24 sm:py-32">
      <PageSection>
        <SectionHeading
          eyebrow="Understand every click"
          title="Analytics without the noise"
          description="See the metrics that matter and explore performance from campaign level down to individual links."
        />

        <div className="border-border bg-card mt-14 overflow-hidden rounded-3xl border p-6 sm:p-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsMetric
              label="Total clicks"
              value="48,291"
              change="+18.2%"
            />
            <AnalyticsMetric
              label="Unique visitors"
              value="31,840"
              change="+12.4%"
            />
            <AnalyticsMetric label="Countries" value="84" change="+6" />
            <AnalyticsMetric
              label="Conversion rate"
              value="8.4%"
              change="+1.2%"
            />
          </div>

          <div className="border-border mt-8 flex h-64 items-end gap-2 rounded-2xl border p-5">
            {[38, 52, 46, 64, 58, 76, 62, 84, 70, 91, 82, 100].map(
              (height, index) => (
                <div
                  key={index}
                  className="bg-primary/80 hover:bg-primary flex-1 rounded-t-md transition-colors"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
        </div>
      </PageSection>
    </section>
  );
}

function AnalyticsMetric({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="border-border rounded-xl border p-5">
      <p className="text-muted-foreground text-sm">{label}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>

        <span className="text-primary text-xs font-medium">{change}</span>
      </div>
    </div>
  );
}

function CtaSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="bg-foreground text-background relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-20 text-center sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />

        <div className="relative">
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
            Make every link count.
          </h2>

          <p className="text-background/70 mx-auto mt-5 max-w-xl text-lg">
            Shorten, measure, understand, and optimize your links with Pulse.
          </p>

          <div className="mt-8">
            <Button size="lg" variant="secondary" className="h-11 px-6" asChild>
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                {isAuthenticated ? "Open dashboard" : "Start for free"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-primary text-sm font-medium">{eyebrow}</p>

      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
        {title}
      </h2>

      <p className="text-muted-foreground mt-5 text-lg leading-8 text-balance">
        {description}
      </p>
    </div>
  );
}

function PageSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

function HeroGrid() {
  return (
    <>
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[64px_64px] opacity-35" />

      <div className="from-background via-background/80 to-background absolute inset-0 -z-10 bg-linear-to-b" />

      <div className="bg-primary/10 absolute top-24 left-1/2 -z-10 size-150 -translate-x-1/2 rounded-full blur-3xl" />
    </>
  );
}
