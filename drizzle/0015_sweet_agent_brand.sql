CREATE TABLE IF NOT EXISTS "generated_text" (
	"user_id" text NOT NULL,
	"plant_id" text,
	"error_message" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_text" ADD CONSTRAINT "generated_text_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_text" ADD CONSTRAINT "generated_text_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
