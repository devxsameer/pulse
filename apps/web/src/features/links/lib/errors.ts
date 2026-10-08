export class LinkConflictError extends Error {
  constructor(message = "Short code is already in use") {
    super(message);
    this.name = "LinkConflictError";
  }
}

export class InvalidLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidLinkError";
  }
}

const PG_UNIQUE_VIOLATION = "23505";

// Drizzle wraps driver errors, so the Postgres code may be on `cause`.
export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;

  for (let depth = 0; depth < 3 && current; depth++) {
    if (
      typeof current === "object" &&
      "code" in current &&
      current.code === PG_UNIQUE_VIOLATION
    ) {
      return true;
    }

    current = current instanceof Error ? current.cause : undefined;
  }

  return false;
}
