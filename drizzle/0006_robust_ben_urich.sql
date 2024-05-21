CREATE TABLE IF NOT EXISTS "gardens_to_plants" (
	"garden_id" text NOT NULL,
	"plant_id" serial NOT NULL,
	"rowIndex" integer,
	"colIndex" integer,
	CONSTRAINT "gardens_to_plants_garden_id_plant_id_pk" PRIMARY KEY("garden_id","plant_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gardens_to_plants" ADD CONSTRAINT "gardens_to_plants_garden_id_gardens_id_fk" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gardens_to_plants" ADD CONSTRAINT "gardens_to_plants_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
