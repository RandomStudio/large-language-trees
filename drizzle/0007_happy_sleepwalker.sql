ALTER TABLE "plants" RENAME COLUMN "position" TO "row";--> statement-breakpoint
ALTER TABLE "plants" ALTER COLUMN "row" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "plants" ADD COLUMN "col" integer;