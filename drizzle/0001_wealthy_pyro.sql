ALTER TABLE "users" RENAME TO "plants";--> statement-breakpoint
ALTER TABLE "plants" DROP CONSTRAINT "users_parent1_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plants" DROP CONSTRAINT "users_parent2_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plants" ADD CONSTRAINT "plants_parent1_id_plants_id_fk" FOREIGN KEY ("parent1_id") REFERENCES "plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plants" ADD CONSTRAINT "plants_parent2_id_plants_id_fk" FOREIGN KEY ("parent2_id") REFERENCES "plants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
