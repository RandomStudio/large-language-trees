CREATE TABLE IF NOT EXISTS "presentation_state" (
	"screen_id" text PRIMARY KEY NOT NULL,
	"priority_level" integer,
	"last_updated" timestamp,
	"contents" json
);
