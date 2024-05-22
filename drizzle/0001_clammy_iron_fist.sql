ALTER TABLE "gardens" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gardens_to_plants" ALTER COLUMN "garden_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gardens_to_plants" ALTER COLUMN "plant_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "plants" ALTER COLUMN "id" SET DATA TYPE text;