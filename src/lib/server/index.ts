import { db } from "./db";
import DefaultSeeds from "../../defaults/seeds.json";
import {
  eventLogs,
  gardens,
  gardensToPlants,
  generatedPlants,
  plants,
  presentationState,
  promptSettingsTable,
  sessionTable,
  users
} from "./schema";
import { eq, isNull } from "drizzle-orm";
import type { InsertPlant, SelectPlant, SelectUser } from "$lib/types";
import { hash } from "@node-rs/argon2";
import { v4 as uuidv4 } from "uuid";
import { pickRandomElement } from "random-elements";
import { defaultUsers } from "../../defaults/users";
import DefaultPrompt from "../../defaults/prompt-config";
import { publishEvent } from "./realtime";
import { SimpleEventNames, type EventFirstPlant } from "$lib/events.types";
import { stripUserInfo } from "$lib/security";

export const populateDefaultPlants = async () => {
  const newPlants: InsertPlant[] = DefaultSeeds;

  await Promise.all(
    newPlants.map((p) => {
      const { commonName, description, properties, imageUrl, id } = p;
      return db.insert(plants).values({
        id,
        commonName,
        description,
        properties,
        imageUrl
      });
    })
  );
};

export const populateDefaultPromptSettings = async () => {
  const defaultPromptSettings = DefaultPrompt;
  await db.insert(promptSettingsTable).values({
    id: uuidv4(),
    textModel: defaultPromptSettings.text.model,
    textTemplate: defaultPromptSettings.text.template,
    imageModel: defaultPromptSettings.image.model,
    imageInstructions: defaultPromptSettings.image.instructions
  });
};

export const getUserByUsername = async (
  username: string
): Promise<SelectUser | undefined> =>
  await db.query.users.findFirst({ where: eq(users.username, username) });

export const getUserById = async (
  userId: string
): Promise<SelectUser | undefined> =>
  await db.query.users.findFirst({ where: eq(users.id, userId) });

export const checkPlantsExist = async () => {
  const existingPlants = await db.query.plants.findMany();
  if (existingPlants.length === 0) {
    console.log(
      "No plants in DB, we will attempt to populate with defaults..."
    );
    await populateDefaultPlants();
  }
};

async function getFirstPlantForUser(): Promise<InsertPlant> {
  // We look for plants that have not been assigned to any garden (yet)
  const plantsToAdd = await db
    .select()
    .from(plants)
    .leftJoin(gardensToPlants, eq(gardensToPlants.plantId, plants.id))
    .where(isNull(gardensToPlants));
  if (plantsToAdd.length > 0) {
    // We found some unassigned plants; so pick a random one...
    // console.log({ plantsToAdd: plantsToAdd.map((p) => p.plants) });
    const thePlant = pickRandomElement(plantsToAdd).plants;
    return thePlant;
  } else {
    // If we can't find one already assigned, just pick any random
    // "original" plant...
    const randomPlants = await db.query.plants.findMany({
      where: isNull(plants.parent1)
    });
    if (randomPlants.length == 0) {
      throw Error("No original plants");
    }

    const randomPlant = pickRandomElement(randomPlants);

    return randomPlant;
  }
}

export const getUserGardenWithPlants = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      myGarden: { with: { plants: { with: { plant: true } } } }
    }
  });
  if (!user) {
    throw Error(`user not found for userId "${userId}"`);
  }
  if (user.myGarden === null) {
    // Create a new garden for the user...
    console.warn("No garden for this user! We need to create one");
    const newGarden = await createNewGarden(user.id, user.username);

    // Also add their first plant to the garden

    const theUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    const theInsertedPlant = await getFirstPlantForUser();
    const thePlant = await db.query.plants.findFirst({
      where: eq(plants.id, theInsertedPlant.id)
    });

    if (!thePlant) {
      throw Error("could not find the plant we just added");
    }

    await addPlantToGarden(thePlant.id, newGarden.id);

    if (thePlant && theUser) {
      const e: EventFirstPlant = {
        name: SimpleEventNames.FIRST_PLANT,
        payload: { plant: thePlant, user: stripUserInfo(theUser) }
      };
      await publishEvent(e);
    }

    const gardenWithPlants = await db.query.gardens.findFirst({
      where: eq(gardens.userId, userId),
      with: { plants: { with: { plant: true } } }
    });

    if (!gardenWithPlants) {
      throw Error("failed to find the garden we just created");
    }

    return gardenWithPlants;
  } else {
    console.log("user has garden named", user.myGarden.name);
    return user.myGarden;
  }
};

export const createNewGarden = async (userId: string, username: string) => {
  console.log("User has no garden (yet)");
  const id = uuidv4();
  const newGardenResult = await db
    .insert(gardens)
    .values({
      id,
      name: `${username}'s Garden`,
      userId: userId
    })
    .returning();

  if (newGardenResult.length == 1) {
    return newGardenResult[0];
  } else {
    throw Error("Something went wrong adding the new user garden");
  }
};

export const addNewPlant = async (plant: InsertPlant): Promise<SelectPlant> => {
  console.log("creating new plant", plant);
  if (typeof plant === "string") {
    throw Error("Plant is not an object");
  }
  const insertedPlant = await db.insert(plants).values(plant).returning();

  return insertedPlant[0];
};

export const attachImageToPlant = async (id: string, imageUrl: string) => {
  const res = await db
    .update(plants)
    .set({ imageUrl })
    .where(eq(plants.id, id))
    .returning({ updatedId: plants.id });
  console.log("attachImageToPlant", res);
  res.forEach((r) => {
    console.log("updated ID", r.updatedId);
  });
  if (res.length == 0) {
    throw Error("nothing got updated!");
  }
};

export const updateWholePlant = async (id: string, newData: SelectPlant) => {
  const { id: originalId, parent1, parent2, ...relevant } = newData;
  const res = await db
    .update(plants)
    .set({ ...relevant })
    .where(eq(plants.id, id))
    .returning({ updatedId: plants.id });
  res.forEach((r) => {
    console.log("updated ID", r.updatedId);
  });
  if (res.length == 0) {
    throw Error("nothing got updated!");
  }
};

export const checkDefaultUsers = async () => {
  const userList = await db.query.users.findMany();
  if (userList.length === 0) {
    console.log("User list empty! Should generate default users");
    await Promise.all(
      defaultUsers.map(async (u) => {
        console.log(`Auto-registering user ${u.id}:${u.username}`);
        const passwordHash = await hash(u.password, {
          // recommended minimum parameters
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1
        });
        await db.insert(users).values({
          id: u.id,
          username: u.username,
          passwordHash,
          isAdmin: true
        });
      })
    );
  }
};

/** Empty all the tables, in the correct order.
 * This *could* be done with Foreign Key Actions (https://orm.drizzle.team/docs/rqb#foreign-key-actions)
 * but for now we do it manually.
 */
export const cleanUp = async () => {
  console.warn("Starting cleanup...");
  await db.delete(eventLogs);
  await db.delete(generatedPlants);
  await db.delete(gardensToPlants);
  await db.delete(gardens);
  await db.delete(sessionTable);
  await db.delete(plants);
  await db.delete(promptSettingsTable);
  await db.delete(generatedPlants);
  await db.delete(presentationState);
  await db.delete(users);
  console.log("...cleanup complete!");
};

export async function addPlantToGarden(plantId: string, gardenId: string) {
  const result = await db
    .insert(gardensToPlants)
    .values({ gardenId, plantId })
    .returning();

  console.log("Added plant", result, "to garden");

  if (result.length === 0) {
    throw Error("error adding plant to garden");
  }
  return result;
}
