import type { PageServerLoad } from "./$types";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { and, eq, or } from "drizzle-orm";
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

  if (username === "admin") {
    console.error("This is the admin user! Shouldn't be on the gallery");
    console.warn("Redirecting...");
    redirect(302, "/app/logout");
  }

  const userWithPlants = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      myGarden: {
        with: {
          plants: {
            with: {
              plant: {
                with: {
                  authorTopUser: true,
                  authorBottomUser: true,
                  parentPlantTop: true,
                  parentPlantBottom: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!userWithPlants) {
    throw Error("failed to load user with garden+plants");
  }

  const myOriginalPlant = userWithPlants.myGarden.plants.find(
    (p) => p.plant.parent1 === null && p.plant.parent2 === null
  );

  if (!myOriginalPlant) {
    throw Error("missing original plant for user " + userId + ", " + username);
  }

  const myOtherPlants = userWithPlants.myGarden.plants.filter(
    (p) => p.plant.id !== myOriginalPlant.plant.id
  );

  const notSproutedPlants = (
    await db.query.generatedPlants.findMany({
      where: and(
        eq(generatedPlants.awaitingConfirmation, false),
        or(
          eq(generatedPlants.authorTop, userId),
          eq(generatedPlants.authorBottom, userId)
        )
      ),
      with: {
        parentPlantTop: true,
        parentPlantBottom: true,
        authorTopUser: true,
        authorBottomUser: true
      }
    })
  ).filter(
    // Exclude any plants that have already sprouted for me
    (e) => myOtherPlants.find((p) => p.plant.id === e.plantId) === undefined
  );

  const awaitingConfirmation = await db.query.generatedPlants.findMany({
    where: and(
      or(
        eq(generatedPlants.authorTop, userId),
        eq(generatedPlants.authorBottom, userId)
      ),
      eq(generatedPlants.awaitingConfirmation, true)
    ),
    with: {
      parentPlantTop: true,
      parentPlantBottom: true,
      authorTopUser: true,
      authorBottomUser: true
    }
  });

  // console.log({
  //   user: stripUserInfo(userWithPlants),
  //   myOriginalPlant,
  //   myOtherPlants,
  //   notSproutedPlants,
  //   awaitingConfirmation
  // });

  const pollinationCount = [
    ...myOtherPlants,
    ...notSproutedPlants,
    ...awaitingConfirmation
  ].length;

  return {
    user: stripUserInfo(userWithPlants),
    myOriginalPlant,
    myOtherPlants,
    notSproutedPlants,
    awaitingConfirmation,
    pollinationCount,
    garden: userWithPlants.myGarden
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
