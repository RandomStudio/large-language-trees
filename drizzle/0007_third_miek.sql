ALTER TABLE "gardens_to_plants" ALTER COLUMN "rowIndex" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gardens_to_plants" ALTER COLUMN "colIndex" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gardens" ADD COLUMN "name" text;