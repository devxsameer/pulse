import { Link } from "@tanstack/react-router";

type AuthFooterProps = {
  text: string;
  linkText: string;
  to: "/login" | "/signup";
};

export function AuthFooter({ text, linkText, to }: AuthFooterProps) {
  return (
    <p className="text-muted-foreground text-center text-sm">
      {text}{" "}
      <Link
        to={to}
        className="text-foreground hover:text-primary font-medium underline underline-offset-4 transition-colors"
      >
        {linkText}
      </Link>
    </p>
  );
}
