ALTER TABLE "generated_plants" DROP CONSTRAINT "generated_plants_author_top_users_id_fk";
--> statement-breakpoint
ALTER TABLE "generated_plants" DROP CONSTRAINT "generated_plants_author_bottom_users_id_fk";
--> statement-breakpoint
ALTER TABLE "generated_plants" ALTER COLUMN "author_top" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generated_plants" ALTER COLUMN "author_bottom" DROP NOT NULL;