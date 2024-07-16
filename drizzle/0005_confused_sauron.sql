ALTER TABLE "prompt_settings" ALTER COLUMN "text_model" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_settings" ALTER COLUMN "text_preamble" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_settings" ALTER COLUMN "text_explanation" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_settings" ALTER COLUMN "text_instructions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_settings" ALTER COLUMN "image_model" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_settings" ALTER COLUMN "image_instructions" SET NOT NULL;