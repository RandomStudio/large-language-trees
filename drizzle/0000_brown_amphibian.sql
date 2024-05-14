CREATE TABLE IF NOT EXISTS "plants" (
	"id" serial PRIMARY KEY NOT NULL,
	"common_name" text,
	"description" text,
	"properties" json,
	"image_url" text,
	"parent1_id" integer,
	"parent2_id" integer,
	"rowIndex" integer,
	"colIndex" integer
);
