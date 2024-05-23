ALTER TABLE "gardens" RENAME TO "gardens2";--> statement-breakpoint
ALTER TABLE "gardens_to_plants" DROP CONSTRAINT "gardens_to_plants_garden_id_gardens_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gardens_to_plants" ADD CONSTRAINT "gardens_to_plants_garden_id_gardens2_id_fk" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens2"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
