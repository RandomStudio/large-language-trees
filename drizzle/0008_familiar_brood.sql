ALTER TABLE "generated_images" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generated_images" ADD COLUMN "error_message" text;