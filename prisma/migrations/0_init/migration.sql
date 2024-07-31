-- CreateTable
CREATE TABLE "event_logs" (
    "id" TEXT NOT NULL,
    "contents" JSON NOT NULL,
    "added" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gardens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "gardens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gardens_to_plants" (
    "garden_id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "colIndex" INTEGER NOT NULL,

    CONSTRAINT "gardens_to_plants_garden_id_plant_id_pk" PRIMARY KEY ("garden_id","plant_id")
);

-- CreateTable
CREATE TABLE "generated_images" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "url" TEXT,
    "error_message" TEXT,

    CONSTRAINT "generated_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "parent1_id" TEXT,
    "parent2_id" TEXT,
    "description" TEXT NOT NULL,
    "properties" JSON NOT NULL,
    "image_url" TEXT,
    "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_top" TEXT,
    "author_bottom" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentation_state" (
    "screen_id" TEXT NOT NULL,
    "priority_level" INTEGER,
    "contents" JSON,

    CONSTRAINT "presentation_state_pkey" PRIMARY KEY ("screen_id")
);

-- CreateTable
CREATE TABLE "prompt_settings" (
    "id" TEXT NOT NULL,
    "text_model" TEXT NOT NULL,
    "text_preamble" TEXT NOT NULL,
    "text_explanation" TEXT NOT NULL,
    "text_instructions" TEXT NOT NULL,
    "image_model" TEXT NOT NULL,
    "image_instructions" TEXT NOT NULL,

    CONSTRAINT "prompt_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seedbanks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "seedbanks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seedbanks_to_plants" (
    "seedbank_id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,

    CONSTRAINT "seedbanks_to_plants_seedbank_id_plant_id_pk" PRIMARY KEY ("seedbank_id","plant_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_admin" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey1" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_unique" ON "users"("username");

-- AddForeignKey
ALTER TABLE "gardens" ADD CONSTRAINT "gardens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gardens_to_plants" ADD CONSTRAINT "gardens_to_plants_garden_id_gardens_id_fk" FOREIGN KEY ("garden_id") REFERENCES "gardens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gardens_to_plants" ADD CONSTRAINT "gardens_to_plants_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_author_bottom_users_id_fk" FOREIGN KEY ("author_bottom") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_author_top_users_id_fk" FOREIGN KEY ("author_top") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seedbanks" ADD CONSTRAINT "seedbanks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seedbanks_to_plants" ADD CONSTRAINT "seedbanks_to_plants_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seedbanks_to_plants" ADD CONSTRAINT "seedbanks_to_plants_seedbank_id_seedbanks_id_fk" FOREIGN KEY ("seedbank_id") REFERENCES "seedbanks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

