ALTER TABLE "plants" ALTER COLUMN "common_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plants" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plants" ALTER COLUMN "properties" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plants" ADD COLUMN "author" text;