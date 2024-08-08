ALTER TABLE "generated_text" DROP CONSTRAINT "generated_text_plant_id_plants_id_fk";
--> statement-breakpoint
ALTER TABLE "generated_text" ADD COLUMN "contents" json;