ALTER TABLE "generated_plants" RENAME COLUMN "image_url" TO "orig_img_url";--> statement-breakpoint
ALTER TABLE "generated_plants" ADD COLUMN "proc_img_url" text;--> statement-breakpoint
ALTER TABLE "generated_plants" DROP COLUMN IF EXISTS "user_started_sprout";--> statement-breakpoint
ALTER TABLE "generated_plants" DROP COLUMN IF EXISTS "user_processed_img";