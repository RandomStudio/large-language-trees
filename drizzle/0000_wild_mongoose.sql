CREATE TABLE IF NOT EXISTS "gardens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gardens_to_plants" (
	"garden_id" text NOT NULL,
	"plant_id" text NOT NULL,
	"rowIndex" integer NOT NULL,
	"colIndex" integer NOT NULL,
	CONSTRAINT "gardens_to_plants_garden_id_plant_id_pk" PRIMARY KEY("garden_id","plant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plants" (
	"id" text PRIMARY KEY NOT NULL,
	"common_name" text,
	"description" text,
	"properties" json,
	"image_url" text,
	"parent1_id" text,
	"parent2_id" text,
	"created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seedbanks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seedbanks_to_plants" (
	"seedbank_id" text NOT NULL,
	"plant_id" text NOT NULL,
	CONSTRAINT "seedbanks_to_plants_seedbank_id_plant_id_pk" PRIMARY KEY("seedbank_id","plant_id")
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
 ALTER TABLE "seedbanks" ADD CONSTRAINT "seedbanks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seedbanks_to_plants" ADD CONSTRAINT "seedbanks_to_plants_seedbank_id_seedbanks_id_fk" FOREIGN KEY ("seedbank_id") REFERENCES "public"."seedbanks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seedbanks_to_plants" ADD CONSTRAINT "seedbanks_to_plants_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
