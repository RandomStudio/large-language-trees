CREATE TABLE IF NOT EXISTS "generated_plants" (
	"plant_id" text PRIMARY KEY NOT NULL,
	"author_top" text,
	"author_bottom" text,
	"contents" json,
	"image_url" text,
	"error_message" text
);
--> statement-breakpoint
DROP TABLE "generated_images";--> statement-breakpoint
DROP TABLE "generated_text";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_plants" ADD CONSTRAINT "generated_plants_author_top_users_id_fk" FOREIGN KEY ("author_top") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_plants" ADD CONSTRAINT "generated_plants_author_bottom_users_id_fk" FOREIGN KEY ("author_bottom") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
