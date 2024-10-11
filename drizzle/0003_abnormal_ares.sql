ALTER TABLE "prompt_settings" ADD COLUMN "text_template" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_settings" DROP COLUMN IF EXISTS "text_preamble";--> statement-breakpoint
ALTER TABLE "prompt_settings" DROP COLUMN IF EXISTS "text_explanation";--> statement-breakpoint
ALTER TABLE "prompt_settings" DROP COLUMN IF EXISTS "text_instructions";