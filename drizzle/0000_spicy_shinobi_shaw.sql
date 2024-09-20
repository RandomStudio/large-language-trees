CREATE TABLE IF NOT EXISTS "event_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"contents" text NOT NULL,
	"added" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gardens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gardens_to_plants" (
	"garden_id" text NOT NULL,
	"plant_id" text NOT NULL,
	"planting_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gardens_to_plants_garden_id_plant_id_pk" PRIMARY KEY("garden_id","plant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "generated_plants" (
	"plant_id" text PRIMARY KEY NOT NULL,
	"given_name" text NOT NULL,
	"author_top" text NOT NULL,
	"author_bottom" text NOT NULL,
	"plant_top" text NOT NULL,
	"plant_bottom" text NOT NULL,
	"contents" json,
	"image_url" text,
	"error_message" text,
	"awaiting_confirmation" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plants" (
	"id" text PRIMARY KEY NOT NULL,
	"common_name" text NOT NULL,
	"description" text NOT NULL,
	"properties" json NOT NULL,
	"image_url" text,
	"parent1" text,
	"parent2" text,
	"author_top" text,
	"author_bottom" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "presentation_state" (
	"screen_id" text PRIMARY KEY NOT NULL,
	"priority_level" integer,
	"contents" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompt_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"text_model" text NOT NULL,
	"text_preamble" text NOT NULL,
	"text_explanation" text NOT NULL,
	"text_instructions" text NOT NULL,
	"image_model" text NOT NULL,
	"image_instructions" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gardens" ADD CONSTRAINT "gardens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gardens_to_plants" ADD CONSTRAINT "gardens_to_plants_garden_id_gardens_id_fk" FOREIGN KEY ("garden_id") REFERENCES "public"."gardens"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gardens_to_plants" ADD CONSTRAINT "gardens_to_plants_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
