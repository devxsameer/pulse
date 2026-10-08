# ADR 0001: Case-insensitive short codes

- **Status:** Accepted (2026-10-07)
- **Source:** ARCHITECTURE.md D5

## Context

Short links get read aloud, typed on phones, and printed. Case-sensitive codes make `/Launch` and `/launch` two different links, which surprises people and enables look-alike squatting. Generated codes also need a predictable capacity.

## Decision

- Store the code with the casing the user typed, for display.
- Enforce uniqueness with a unique index on `lower(short_code)`; look up with `lower(short_code) = lower($1)`.
- Generated codes are 7 characters of lowercase base36 (36⁷ ≈ 7.8 × 10¹⁰).
- Insert directly and catch Postgres `23505` (retry up to 5 times for generated codes); never check-then-insert.

## Consequences

- One code per spelling regardless of case: no squatting on case variants.
- Mixed-case generation would add no capacity, so generated codes stay lowercase.
- With custom domains (v1.1) the index becomes `(domain_id, lower(short_code))`.
