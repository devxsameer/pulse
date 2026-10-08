DROP INDEX "links_workspace_created_at_idx";--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "favicon_url" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "links_workspace_live_created_idx" ON "links" USING btree ("workspace_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "links"."deleted_at" is null;