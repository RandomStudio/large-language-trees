import { db } from "../db";
import DefaultSeeds from "../../../defaults/seeds.json";
import type { Plant } from "../../../routes/types";
import { plantsTable } from "../schema";

export const getAllPlants = async () => {
  const existingPlants = await db.query.plantsTable.findMany();
  if (existingPlants.length === 0) {
    console.log(
      "No plants in DB, we will attempt to populate with defaults...",
    );
    const newPlants: Plant[] = DefaultSeeds;
    await Promise.all(
      newPlants.map((p) => {
        const { commonName, description, properties, imageUrl } = p;
        console.log("inserting", { commonName });
        return db
          .insert(plantsTable)
          .values({ commonName, description, properties, imageUrl });
      }),
    );
    return await db.query.plantsTable.findMany();
  } else {
    return existingPlants;
  }
};

export const addNew = async (plant: Plant) => {
  console.log("dd new plant", plant, typeof plant);
  if (typeof plant === "string") {
    throw Error("Plant is not an object");
  }
  const { commonName, description, properties, parent1, parent2 } = plant;
  await db
    .insert(plantsTable)
    .values({ commonName, description, properties, parent1, parent2 });
};
