ALTER TABLE "plants" RENAME COLUMN "author" TO "author_top";--> statement-breakpoint
ALTER TABLE "plants" ADD COLUMN "author_bottom" text;