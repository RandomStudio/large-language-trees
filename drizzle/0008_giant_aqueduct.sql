ALTER TABLE "plants" ADD COLUMN "positionRow" integer;--> statement-breakpoint
ALTER TABLE "plants" ADD COLUMN "positionCol" integer;--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN IF EXISTS "row";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN IF EXISTS "col";