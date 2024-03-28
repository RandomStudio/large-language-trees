CREATE TABLE IF NOT EXISTS "parentage" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_1_id" integer,
	"parent_2_id" integer
);
--> statement-breakpoint
DROP TABLE "plants_to_plants";