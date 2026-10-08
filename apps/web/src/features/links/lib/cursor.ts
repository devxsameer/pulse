import { z } from "zod";

export type LinkCursor = {
  createdAt: Date;
  id: string;
};

const cursorPayloadSchema = z.object({
  c: z.iso.datetime(),
  i: z.uuid(),
});

function toBase64Url(value: string) {
  return btoa(value)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  return atob(value.replaceAll("-", "+").replaceAll("_", "/"));
}

export function encodeCursor(cursor: LinkCursor) {
  return toBase64Url(
    JSON.stringify({ c: cursor.createdAt.toISOString(), i: cursor.id }),
  );
}

// Returns null for anything malformed so a tampered cursor just restarts the list.
export function decodeCursor(value: string): LinkCursor | null {
  try {
    const payload = cursorPayloadSchema.parse(JSON.parse(fromBase64Url(value)));
    return { createdAt: new Date(payload.c), id: payload.i };
  } catch {
    return null;
  }
}
