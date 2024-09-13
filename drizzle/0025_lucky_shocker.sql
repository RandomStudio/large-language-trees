ALTER TABLE "generated_plants" RENAME COLUMN "plant_top_id" TO "plant_top";--> statement-breakpoint
ALTER TABLE "generated_plants" RENAME COLUMN "plant_bottom_id" TO "plant_bottom";--> statement-breakpoint
ALTER TABLE "plants" RENAME COLUMN "parent1_id" TO "parent1";--> statement-breakpoint
ALTER TABLE "plants" RENAME COLUMN "parent2_id" TO "parent2";--> statement-breakpoint
ALTER TABLE "generated_plants" DROP CONSTRAINT "generated_plants_plant_top_id_plants_id_fk";
--> statement-breakpoint
ALTER TABLE "generated_plants" DROP CONSTRAINT "generated_plants_plant_bottom_id_plants_id_fk";
--> statement-breakpoint
ALTER TABLE "plants" DROP CONSTRAINT "plants_author_top_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plants" DROP CONSTRAINT "plants_author_bottom_users_id_fk";
