import { db } from "$lib/server/db";
import { presentationState } from "$lib/server/schema";
import type { PresentationDisplayState } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad<{
  displays: PresentationDisplayState[];
}> = async ({}) => {
  const state = await db.select().from(presentationState);
  return { displays: state };
};
