import { ADMIN_GARDEN_SHARED } from "$env/static/private";
import {
  addPlantToSeedbank,
  getUserByUsername,
  getUserSeedbank
} from "$lib/server";
import { db } from "$lib/server/db";
import { seedbanksToPlants } from "$lib/server/schema";
import type { SeedbankEntry } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as SeedbankEntry;

  console.log("POST plantsInSeedbank", data);

  await addPlantToSeedbank(data.plantId, data.seedbankId);

  if (ADMIN_GARDEN_SHARED === "true") {
    console.warn(
      "ADMIN_GARDEN_SHARED enabled; also add this plant to admin seedbank"
    );
    const adminUser = await getUserByUsername("admin");
    if (adminUser) {
      const adminSeedbank = await getUserSeedbank(adminUser.id);
      if (adminSeedbank) {
        const exists = await db
          .select()
          .from(seedbanksToPlants)
          .where(
            and(
              eq(seedbanksToPlants.seedbankId, adminSeedbank.id),
              eq(seedbanksToPlants.plantId, data.plantId)
            )
          );
        if (exists.length === 0) {
          await addPlantToSeedbank(data.plantId, adminSeedbank.id);
          console.log("...added to admin user seedbank OK");
        } else {
          console.log("...plant already exists in admin seedbank; ignore");
        }
      }
    }
  }

  return json(data, { status: 201 });
};
