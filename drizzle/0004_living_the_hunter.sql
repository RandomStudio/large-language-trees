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
