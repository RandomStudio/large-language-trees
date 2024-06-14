import { ADMIN_GARDEN_SHARED } from "$env/static/private";
import {
  addPlantToSeedbank,
  getUserByUsername,
  getUserSeedbank
} from "$lib/server";
import type { SeedbankEntry } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as SeedbankEntry;

  console.log("POST plantsInSeedbank", data);

  await addPlantToSeedbank(data.plantId, data.seedbankId);

  if (ADMIN_GARDEN_SHARED === "true") {
    console.warn(
      "ADMIN_GARDEN_SHARED enabled; also add this plant to admin garden"
    );
    const adminUser = await getUserByUsername("admin");
    if (adminUser) {
      const adminSeedbank = await getUserSeedbank(adminUser.id);
      if (adminSeedbank) {
        await addPlantToSeedbank(data.plantId, adminSeedbank.id);
        console.log("...added to admin user seedbank OK");
      }
    }
  }

  return json(data, { status: 201 });
};
