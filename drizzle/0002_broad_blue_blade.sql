CREATE TABLE IF NOT EXISTS "plants_to_plants" (
	"parent_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	CONSTRAINT "plants_to_plants_parent_id_child_id_pk" PRIMARY KEY("parent_id","child_id")
);
--> statement-breakpoint
ALTER TABLE "plants" DROP CONSTRAINT "plants_parent1_id_plants_id_fk";
--> statement-breakpoint
ALTER TABLE "plants" DROP CONSTRAINT "plants_parent2_id_plants_id_fk";
--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN IF EXISTS "parent1_id";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN IF EXISTS "parent2_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plants_to_plants" ADD CONSTRAINT "plants_to_plants_parent_id_plants_id_fk" FOREIGN KEY ("parent_id") REFERENCES "plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plants_to_plants" ADD CONSTRAINT "plants_to_plants_child_id_plants_id_fk" FOREIGN KEY ("child_id") REFERENCES "plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
