DO $$ BEGIN
 ALTER TABLE "generated_plants" ADD CONSTRAINT "generated_plants_plant_top_id_plants_id_fk" FOREIGN KEY ("plant_top_id") REFERENCES "public"."plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_plants" ADD CONSTRAINT "generated_plants_plant_bottom_id_plants_id_fk" FOREIGN KEY ("plant_bottom_id") REFERENCES "public"."plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
