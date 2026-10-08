import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "#/components/layouts/coming-soon";

export const Route = createFileRoute("/_app/qr-codes")({
  component: () => (
    <ComingSoon
      title="QR Codes"
      description="Download QR codes for any of your short links."
    />
  ),
});
