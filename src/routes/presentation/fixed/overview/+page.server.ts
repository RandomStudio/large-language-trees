import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";
import { gardens, gardensToPlants, plants } from "$lib/server/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({}) => {
  // We get all plants from all gardens, but no duplicates!
  const dedupPlantList = await db
    .selectDistinctOn([gardensToPlants.plantId], {
      plantId: gardensToPlants.plantId,
      imageUrl: plants.imageUrl,
      properties: plants.properties,
      gardenId: gardensToPlants.gardenId,
      timestamp: gardensToPlants.plantingDate
    })
    .from(gardensToPlants)
    .leftJoin(plants, eq(gardensToPlants.plantId, plants.id));
  // .orderBy(gardensToPlants.plantingDate);

  console.log({ dedupPlantList });

  // // TODO: neeed more efficient way of doing this, at least for Overview query...
  // const gardenWithPlants: GardenWithPlants = {
  //   id: "overview-generated",
  //   name: "Overview",
  //   userId: "everybody",
  //   plants: await Promise.all(
  //     dedupPlantList.map(async (p) => {
  //       const plantDetails = await db.query.plants.findFirst({
  //         where: eq(plants.id, p.plantId)
  //       });
  //       if (!plantDetails) {
  //         throw Error("failed to match plant on id " + p.plantId);
  //       }
  //       return plantDetails;
  //     })
  //   )
  // };

  return {
    dedupPlantList
  };
};
