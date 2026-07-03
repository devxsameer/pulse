import { BarChart3 } from "lucide-react";

const data = [34, 46, 41, 58, 52, 68, 61, 78, 70, 88, 81, 96, 85, 100];

export function AnalyticsOverview() {
  return (
    <div className="bg-card rounded-xl border">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-semibold tracking-tight">Click analytics</h2>

          <p className="text-muted-foreground mt-1 text-xs">
            Click activity over the last 14 days
          </p>
        </div>

        <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
          <BarChart3 className="text-muted-foreground size-4" />
        </div>
      </div>

      <div className="p-5">
        <div className="mb-6">
          <p className="text-3xl font-semibold tracking-tight">18,429</p>

          <p className="text-muted-foreground mt-1 text-xs">
            Total clicks in this period
          </p>
        </div>

        <div className="flex h-64 items-end gap-1.5">
          {data.map((height, index) => (
            <div
              key={index}
              className="group relative flex h-full flex-1 items-end"
            >
              <div
                className="bg-primary/75 group-hover:bg-primary w-full rounded-t-sm transition-colors"
                style={{
                  height: `${height}%`,
                }}
              />

              <div className="bg-popover text-popover-foreground pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 hidden -translate-x-1/2 rounded-md border px-2 py-1 text-xs shadow-sm group-hover:block">
                {Math.round(height * 18.4)} clicks
              </div>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-3 flex justify-between text-[10px]">
          <span>Jun 12</span>
          <span>Jun 18</span>
          <span>Jun 25</span>
        </div>
      </div>
    </div>
  );
}
