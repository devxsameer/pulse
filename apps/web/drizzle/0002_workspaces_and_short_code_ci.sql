CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "links" RENAME COLUMN "user_id" TO "created_by";--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "links" DROP CONSTRAINT "links_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "links_short_code_unique_idx";--> statement-breakpoint
DROP INDEX "links_user_id_idx";--> statement-breakpoint
DROP INDEX "links_user_created_at_idx";--> statement-breakpoint
DROP INDEX "links_user_active_idx";--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "workspace_id" text;--> statement-breakpoint
-- Backfill: every existing user gets a personal workspace (same slug scheme as ensurePersonalWorkspace) and owns their links through it.
INSERT INTO "organization" ("id", "name", "slug")
SELECT gen_random_uuid()::text,
       CASE WHEN coalesce("name", '') = '' THEN 'Personal workspace' ELSE "name" || '''s workspace' END,
       'personal-' || lower("id")
FROM "user";--> statement-breakpoint
INSERT INTO "member" ("id", "organization_id", "user_id", "role")
SELECT gen_random_uuid()::text, o."id", u."id", 'owner'
FROM "user" u
JOIN "organization" o ON o."slug" = 'personal-' || lower(u."id");--> statement-breakpoint
UPDATE "links" l
SET "workspace_id" = o."id"
FROM "organization" o
WHERE o."slug" = 'personal-' || lower(l."created_by");--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_organization_user_unique_idx" ON "member" USING btree ("organization_id","user_id");--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_workspace_id_organization_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "links_short_code_lower_unique_idx" ON "links" USING btree (lower("short_code"));--> statement-breakpoint
CREATE INDEX "links_workspace_created_at_idx" ON "links" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "links_created_by_idx" ON "links" USING btree ("created_by");