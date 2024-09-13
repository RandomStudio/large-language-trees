import type { PageServerLoad } from "./$types";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { eq, or } from "drizzle-orm";
import { generatedPlants, users } from "$lib/server/schema";
import { stripUserInfo } from "$lib/security";

export const load: PageServerLoad = async ({ locals }) => {
  const username = locals.user?.username;
  const userId = locals.user?.id;
  if (!username) {
    console.log("Not logged in!");
    redirect(302, "/app");
  }

  if (!userId) {
    throw Error("no user ID");
  }

  const userWithSeedbankPlants = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      myGarden: true,
      mySeedbank: { with: { plantsInSeedbank: { with: { plant: true } } } }
    }
  });

  if (!userWithSeedbankPlants) {
    throw Error("failed to load user with seedbank+plants");
  }

  const myOriginalPlant =
    userWithSeedbankPlants.mySeedbank.plantsInSeedbank.find(
      (p) => p.plant.parent1 === null && p.plant.parent2 === null
    );

  if (!myOriginalPlant) {
    throw Error("missing plant(s)");
  }

  const myOtherPlants =
    userWithSeedbankPlants.mySeedbank.plantsInSeedbank.filter(
      (p) => p.plant.id !== myOriginalPlant.plant.id
    );

  const notSproutedPlants = (
    await db.query.generatedPlants.findMany({
      where: or(
        eq(generatedPlants.authorTop, userId),
        eq(generatedPlants.authorBottom, userId)
      ),
      with: {
        parentPlantTop: true,
        parentPlantBottom: true,
        authorTop: true,
        authorBottom: true
      }
    })
  ).filter(
    (e) => myOtherPlants.find((p) => p.plant.id === e.plantId) === undefined
  );

  return {
    user: stripUserInfo(userWithSeedbankPlants),
    myOriginalPlant,
    myOtherPlants,
    notSproutedPlants,
    garden: userWithSeedbankPlants.myGarden
  };
};

export const actions: Actions = {
  logout: async (event) => {
    if (!event.locals.session) {
      return fail(401);
    }
    await lucia.invalidateSession(event.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
    redirect(302, "/app");
  }
};
