type ComingSoonProps = {
  title: string;
  description: string;
};

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>

      <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
        {description}
      </p>

      <div className="text-muted-foreground mt-8 rounded-xl border border-dashed p-10 text-center text-sm">
        Coming soon.
      </div>
    </div>
  );
}
