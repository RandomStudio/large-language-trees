DO $$ BEGIN
 ALTER TABLE "plants" ADD CONSTRAINT "plants_author_top_users_id_fk" FOREIGN KEY ("author_top") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plants" ADD CONSTRAINT "plants_author_bottom_users_id_fk" FOREIGN KEY ("author_bottom") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
