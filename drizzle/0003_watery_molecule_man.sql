CREATE TABLE IF NOT EXISTS "prompt_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"text_model" text,
	"text_preamble" json,
	"text_explanation" json,
	"text_instructions" json,
	"image_model" text,
	"image_instructions" text
);
