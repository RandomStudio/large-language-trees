import { db } from "$lib/server/db";
import { plants } from "$lib/server/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import type { PlantProperties } from "$lib/types";

export const load: PageServerLoad = async ({ params }) => {
  const plantId = params["id"];
  if (!plantId) {
    throw Error("no plant ID provided in route");
  }

  const plant = await db.query.plants.findFirst({
    where: eq(plants.id, plantId),
    with: {
      authorTopUser: true,
      authorBottomUser: true,
      parentPlantTop: true,
      parentPlantBottom: true
    }
  });

  if (!plant) {
    throw Error("plant not found with ID " + plantId);
  }

  if ((plant.properties as PlantProperties)["funFact"]) {
    console.log("We have a fun fact!");
    return {
      ...plant,
      description: (plant.properties as PlantProperties)["funFact"]
    };
  } else {
    return {
      ...plant
    };
  }
};
