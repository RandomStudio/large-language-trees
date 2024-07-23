import { db } from "./db";
import DefaultSeeds from "../../defaults/seeds.json";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import OpenAI from "openai";
import { ADMIN_GARDEN_SHARED, OPENAI_API_KEY } from "$env/static/private";
import {
  gardens,
  gardensToPlants,
  generatedImages,
  plants,
  promptSettingsTable,
  seedbanks,
  seedbanksToPlants,
  sessions,
  users
} from "./schema";
import { eq, isNull, not } from "drizzle-orm";
import { GRID_HEIGHT, GRID_WIDTH } from "../../defaults/constants";
import type {
  GardenPlantEntry,
  InsertPlant,
  MyGarden,
  MySeeds,
  SeedbankEntry,
  SeedbankEntryWithPlant,
  SelectGarden,
  SelectPlant,
  SelectUser,
  UserWithGarden,
  UserWithSeedbank
} from "$lib/types";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { v4 as uuidv4 } from "uuid";
import {
  pickMultipleRandomElements,
  pickRandomElement,
  pickRandomIndexes
} from "random-elements";
import { defaultUsers } from "../../defaults/users";
import DefaultPrompt from "../../defaults/prompt-config";
import { publishEvent } from "./realtime";

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
    textPreamble: defaultPromptSettings.text.preamble.text,
    textExplanation: defaultPromptSettings.text.explanation.text,
    textInstructions: defaultPromptSettings.text.instructions.text,
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

export const getUserSeeds = async (userId: string): Promise<MySeeds> => {
  const seedBank = await db.query.seedbanks.findFirst({
    where: eq(seedbanks.userId, userId),
    with: { plantsInSeedbank: { with: { plant: true } } }
  });
  if (seedBank) {
    // console.log(JSON.stringify({ seedBank }));
    return seedBank;
  } else {
    const user = await getUserById(userId);
    console.log(
      "No seedbank for user",
      user?.username,
      "; Will have to create one and populate it"
    );
    await createNewSeedbank(userId);
    return await getUserSeeds(userId);
  }
};

export const createNewSeedbank = async (userId: string) => {
  const result = await db
    .insert(seedbanks)
    .values({
      id: uuidv4(),
      userId
    })
    .returning();
  const newSeedbank = result[0];
  const adminUser = await getUserByUsername("admin");
  if (!adminUser) {
    throw Error("Admin user not found; something is wrong!");
  }
  if (userId === adminUser.id) {
    console.log(
      "This is the admin user. No need to add initial plants to this seedbank"
    );
    return;
  }

  const thePlant = await getNewPlantForUser();

  if (thePlant) {
    await publishEvent({ name: "newUserFirstPlant", payload: { ...thePlant } });
  }

  await addPlantToSeedbank(thePlant.id, newSeedbank.id);

  if (ADMIN_GARDEN_SHARED === "true") {
    console.warn(
      "ADMIN_GARDEN_SHARED enabled, so we will also add this plant to the admin user's seedbank..."
    );
    const adminSeedbank = await getUserSeeds(adminUser.id);
    if (adminUser && adminSeedbank) {
      addPlantToSeedbank(thePlant.id, adminSeedbank.id);
    } else {
      throw Error("admin user not found or admin seedbank not found");
    }
  }
};

async function getNewPlantForUser() {
  // We look for plants that have not been assigned to any seedbank (yet)
  // This is safe for now, because we don't expect the number of users (and thus seedbanks)
  // to exceed the number of available plants.
  const plantsToAdd = await db
    .select()
    .from(plants)
    .leftJoin(seedbanksToPlants, eq(seedbanksToPlants.plantId, plants.id))
    .where(isNull(seedbanksToPlants));
  if (plantsToAdd.length > 0) {
    // await db.insert(seedbanksToPlants).values({
    //   seedbankId: newSeedbank.id,
    //   plantId: plant[0].plants.id
    // });
    const thePlant = plantsToAdd[0].plants;
    return thePlant;
  } else {
    // TODO: we could, instead, pick a random new plant, or even generate one
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

export const getUserGarden = async (userId: string): Promise<MyGarden> => {
  const user: UserWithGarden | undefined = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      myGarden: { with: { plantsInGarden: { with: { plant: true } } } }
    }
  });
  if (user) {
    if (user.myGarden === null) {
      // Create a new garden for the user...
      console.warn("No garden for this user! We need to create one");
      const newGarden = await createNewGarden(user.id, user.username);

      // Also add their first seed(s) to the garden (and this is not the admin user!)...

      if (user.username !== "admin") {
        await addDefaultSeedsToNewGarden(userId, newGarden);
      }

      return newGarden;
    } else {
      console.log("user has garden named", user.myGarden.name);
      return user.myGarden;
    }
  } else {
    throw Error(`user not found for userId "${userId}"`);
  }
};

export const getUserSeedbank = async (userId: string) =>
  await db.query.seedbanks.findFirst({ where: eq(seedbanks.userId, userId) });

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
    return await getUserGarden(userId);
  } else {
    throw Error("Something went wrong adding the new user garden");
  }
};

export const addNewPlant = async (plant: InsertPlant): Promise<InsertPlant> => {
  console.log("creating new plant", plant);
  if (typeof plant === "string") {
    throw Error("Plant is not an object");
  }
  const insertedPlant = await db.insert(plants).values(plant).returning();

  return insertedPlant[0];
};

export const generate = async (
  prompt: ChatCompletionMessageParam[],
  parents: [SelectPlant, SelectPlant]
): Promise<InsertPlant | null> => {
  let offspring: InsertPlant | null = null;

  if (prompt && parents) {
    console.log("Using prompt: ******** \n", prompt);

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      messages: prompt,
      model: "gpt-3.5-turbo"
    });

    console.log("response:", completion.choices);

    for (const res of completion.choices) {
      console.log(JSON.stringify(res));
      const formattedContent = res.message.content || "{}";

      offspring = parseNewPlant(formattedContent);
      if (offspring) {
        console.log("Offspring:", offspring);
      } else {
        throw Error("Oops, couldn't parse the offspring text");
      }
    }
  }

  return offspring;
};

const parseNewPlant = (text: string): InsertPlant | null => {
  const json = JSON.parse(text);
  if (json["commonName"] && json["description"] && json["properties"]) {
    const id = uuidv4();
    console.log("JSON appears to have the valid fields");
    return {
      id,
      commonName: json["commonName"],
      description: json["description"],
      properties: { ...json["properties"] }
    };
  } else {
    throw Error("Fields missing from: " + JSON.stringify(Object.keys(json)));
  }
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
  await db.delete(seedbanksToPlants);
  await db.delete(gardensToPlants);
  await db.delete(seedbanks);
  await db.delete(gardens);
  await db.delete(sessions);
  await db.delete(users);
  await db.delete(plants);
  await db.delete(promptSettingsTable);
  await db.delete(generatedImages);
  console.log("...cleanup complete!");
};

async function addDefaultSeedsToNewGarden(userId: string, newGarden: MyGarden) {
  const seeds = await getUserSeeds(userId);
  const user = await getUserById(userId);
  seeds.plantsInSeedbank.forEach(async (seed) => {
    console.log(
      "addDefaultSeedsToNewGarden: Add plant",
      seed.plant.id,
      "to garden",
      newGarden.id,
      "for user",
      user?.username
    );
    await addPlantToGarden(seed.plant.id, newGarden.id);

    const adminUser = await getUserByUsername("admin");
    console.log("Checked adminUser is", typeof adminUser);

    if (!adminUser) {
      throw Error("Admin user not found!");
    }

    if (userId === adminUser.id) {
      console.warn("We are the admin user; no need to add seed to our garden");
    }

    if (ADMIN_GARDEN_SHARED === "true") {
      console.warn(
        "ADMIN_GARDEN_SHARED enabled; Also add this plant to the Admin user's garden"
      );
      const adminUserGarden = await getUserGarden(adminUser.id);
      if (adminUserGarden) {
        await addPlantToGarden(seed.plant.id, adminUserGarden.id);
      } else {
        throw Error("no admin user garden!");
      }
    } else {
      console.warn("ADMIN_GARDEN_SHARED disabled; skip this");
    }
  });
}

export async function addPlantToGarden(plantId: string, gardenId: string) {
  const otherPlants = await db.query.gardensToPlants.findMany({
    where: eq(gardensToPlants.gardenId, gardenId)
  });

  const { col, row } = findEmpty(otherPlants, { row: 0, col: 0 });

  console.log("Found empty spot:", { col, row });

  const result = await db
    .insert(gardensToPlants)
    .values({ gardenId, plantId, rowIndex: row, colIndex: col })
    .returning();

  console.log("Added plant", result, "to garden");

  if (result.length === 0) {
    throw Error("error adding plant to garden");
  }
}

const findEmpty = (
  otherPlants: GardenPlantEntry[],
  closeTo: { row: number; col: number }
) => {
  let col = closeTo.col;
  let row = closeTo.row;

  while (
    otherPlants.find(
      (entry) => entry.colIndex === col && entry.rowIndex === row
    )
  ) {
    col = Math.floor(Math.random() * GRID_WIDTH);
    row = Math.floor(Math.random() * GRID_HEIGHT);
  }

  return { col, row };
};

export async function addPlantToSeedbank(plantId: string, seedbankId: string) {
  const entry: SeedbankEntry = {
    plantId,
    seedbankId
  };

  const result = await db.insert(seedbanksToPlants).values(entry).returning();

  if (result.length === 0) {
    throw Error("error adding plant to seedbank/gallery");
  }
}
