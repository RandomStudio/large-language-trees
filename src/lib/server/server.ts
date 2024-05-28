import { db } from "./db";
import DefaultSeeds from "../../defaults/seeds.json";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "$env/static/private";
import {
  gardens,
  gardensToPlants,
  plants,
  seedbanks,
  seedbanksToPlants,
  sessions,
  users,
} from "./schema";
import { eq, isNull, not } from "drizzle-orm";
import { GRID_HEIGHT, GRID_WIDTH } from "../../defaults/constants";
import type {
  InsertPlant,
  MyGarden,
  SeedbankEntryWithPlant,
  SelectGarden,
  SelectPlant,
  SelectUser,
  UserWithGarden,
  UserWithSeedbank,
} from "$lib/types";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { v4 as uuidv4 } from "uuid";
import { pickMultipleRandomElements, pickRandomIndexes } from "random-elements";
import { defaultUsers } from "../../defaults/users";

const populateDefaultPlants = async () => {
  const newPlants: InsertPlant[] = DefaultSeeds;

  // const rows = getRandomIndices(GRID_HEIGHT, newPlants.length);
  // const columns = getRandomIndices(GRID_WIDTH, newPlants.length);

  await Promise.all(
    newPlants.map((p) => {
      const { commonName, description, properties, imageUrl, id } = p;
      return db.insert(plants).values({
        id,
        commonName,
        description,
        properties,
        imageUrl,
      });
    })
  );
};

export const checkPlantsExist = async () => {
  const existingPlants = await db.query.plants.findMany();
  if (existingPlants.length === 0) {
    console.log(
      "No plants in DB, we will attempt to populate with defaults..."
    );
    await populateDefaultPlants();
  }
};

export const getUserSeeds = async (
  userId: string
): Promise<SeedbankEntryWithPlant[]> => {
  const seedBank = await db.query.seedbanks.findFirst({
    where: eq(seedbanks.userId, userId),
    with: { plantsInSeedbank: { with: { plant: true } } },
  });
  if (seedBank) {
    console.log(JSON.stringify({ seedBank }));
    return seedBank.plantsInSeedbank;
  } else {
    console.log("No seedbank! Will have to create one and populate it");
    const result = await db
      .insert(seedbanks)
      .values({
        id: uuidv4(),
        userId,
      })
      .returning();
    const newSeedbank = result[0];
    const plant = await db
      .select()
      .from(plants)
      .leftJoin(seedbanksToPlants, eq(seedbanksToPlants.plantId, plants.id))
      .where(isNull(seedbanksToPlants));
    console.log("plant with inSeedBanks:", plant);

    if (plant) {
      await db.insert(seedbanksToPlants).values({
        seedbankId: newSeedbank.id,
        plantId: plant[0].plants.id,
      });
      return await getUserSeeds(userId);
    } else {
      throw Error("suitable plant not found");
    }
  }
};

export const getUserGarden = async (userId: string): Promise<MyGarden> => {
  const user: UserWithGarden | undefined = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      myGarden: { with: { plantsInGarden: { with: { plant: true } } } },
    },
  });
  if (user) {
    // console.log("full result:", JSON.stringify(user, null, 2));
    if (user.myGarden === null) {
      console.log("User has no garden (yet)");
      const id = uuidv4();
      const newGardenResult = await db
        .insert(gardens)
        .values({
          id,
          name: `${user.username}'s Garden`,
          userId: user.id,
        })
        .returning();
      const newGarden = newGardenResult[0];

      // Also add default plants into this garden
      const defaultPlants = DefaultSeeds;

      let rowIndex = 0;
      let colIndex = 0;

      await Promise.all(
        defaultPlants.map(async (plant) => {
          colIndex += 2;
          if (colIndex >= GRID_WIDTH - 1) {
            rowIndex += 2;
            colIndex = 0;
          }
          console.log(
            `Adding plant ${plant.commonName} at position [${colIndex},${rowIndex}]...`
          );
          const plantId = plant.id;
          const gardenId = newGarden.id;
          console.log("keys:", { plantId, gardenId });
          await db.insert(gardensToPlants).values({
            plantId,
            gardenId,
            colIndex,
            rowIndex,
          });
        })
      );

      return await getUserGarden(userId);

      // return { id: 0, name: "bla", userId: user.id };
    } else {
      console.log("user has garden named", user.myGarden.name);
      // const gardenWithPlants = await db.query.gardens.findMany({
      //   with: { gardensToPlants: true },
      // });
      // console.log(JSON.stringify(gardenWithPlants, null, 2));
      return user.myGarden;
    }
  } else {
    throw Error(`user not found for userId "${userId}"`);
  }
};

export const addNew = async (plant: InsertPlant): Promise<InsertPlant> => {
  console.log("creating new plant", plant);
  if (typeof plant === "string") {
    throw Error("Plant is not an object");
  }
  // const { commonName, description, properties } = plant;
  const insertedPlant = await db.insert(plants).values(plant).returning();
  // const insertedId = insertedPlant[0].insertedId;
  // if (plant.parent1 && plant.parent2) {
  //   console.log("Adding two parents to this new plant:", parentIds);
  //   await db
  //     .update(plants)
  //     .set({ parent1: parentIds[0], parent2: parentIds[1] })
  //     .where(eq(plants.id, insertedId));
  // }
  // if (parentIds.length !== 0 && parentIds.length !== 2) {
  //   throw Error("A plant can only have exactly zero or 2 parents!");
  // }
  return insertedPlant[0];
};

export const generate = async (
  prompt: ChatCompletionMessageParam[],
  parents: [SelectPlant, SelectPlant]
) => {
  let offspring: InsertPlant | null = null;

  if (prompt && parents) {
    console.log("Using prompt: ******** \n", prompt);

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      messages: prompt,
      model: "gpt-3.5-turbo",
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
      properties: { ...json["properties"] },
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
          parallelism: 1,
        });
        await db.insert(users).values({
          id: u.id,
          username: u.username,
          passwordHash,
          isAdmin: true,
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
  console.log("...cleanup complete!");
};
