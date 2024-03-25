import { db } from "../db";
import DefaultSeeds from "../../../defaults/seeds.json";
import type { Plant } from "../../../routes/types";
import { plantsTable } from "../schema";

export const getAllPlants = async () => {
  const plants = await db.query.plantsTable.findMany();
  if (plants.length === 0) {
    console.log(
      "No plants in DB, we will attempt to populate with defaults...",
    );
    const plants: Plant[] = DefaultSeeds;
    await Promise.all(
      plants.map((p) => {
        const { commonName, description, properties, imageUrl } = p;
        console.log("inserting", { commonName });
        return db
          .insert(plantsTable)
          .values({ commonName, description, properties, imageUrl });
      }),
    );
    return await db.query.plantsTable.findMany();
  } else {
    return plants;
  }
};
