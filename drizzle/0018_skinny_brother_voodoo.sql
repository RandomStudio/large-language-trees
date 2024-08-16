ALTER TABLE "gardens_to_plants" ADD COLUMN "planting_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gardens_to_plants" DROP COLUMN IF EXISTS "rowIndex";--> statement-breakpoint
ALTER TABLE "gardens_to_plants" DROP COLUMN IF EXISTS "colIndex";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN IF EXISTS "created";