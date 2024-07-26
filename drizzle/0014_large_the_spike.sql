CREATE TABLE IF NOT EXISTS "event_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"contents" json NOT NULL,
	"added" timestamp with time zone DEFAULT now() NOT NULL
);
