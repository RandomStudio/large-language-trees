import { db } from "$lib/server/db";
import { presentationState } from "$lib/server/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const displays = await db
    .select()
    .from(presentationState)
    .orderBy(presentationState.id);
  return { displays };
};
