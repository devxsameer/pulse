export type LinkStatus = "active" | "disabled" | "expired";

type StatusInput = {
  isActive: boolean;
  expiresAt: Date | null;
};

// Precedence: disabled > expired > active. Deleted links never reach the UI.
export function getLinkStatus(link: StatusInput, now = new Date()): LinkStatus {
  if (!link.isActive) return "disabled";
  if (link.expiresAt && link.expiresAt <= now) return "expired";
  return "active";
}
