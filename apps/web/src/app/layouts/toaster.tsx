import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "../providers/theme-provider";

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return <SonnerToaster theme={resolvedTheme} position="top-center" />;
}
