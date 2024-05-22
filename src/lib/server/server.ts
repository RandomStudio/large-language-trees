import { db } from "./db";
import DefaultSeeds from "../../defaults/seeds.json";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "$env/static/private";
import { gardens, gardensToPlants, plants, users } from "./schema";
import { eq } from "drizzle-orm";
import { GRID_HEIGHT, GRID_WIDTH } from "../../defaults/constants";
import type {
  InsertPlant,
  MyGarden,
  SelectGarden,
  SelectPlant,
  SelectUser,
  UserWithGarden,
} from "$lib/types";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { v4 as uuidv4 } from "uuid";
import { pickMultipleRandomElements, pickRandomIndexes } from "random-elements";

export const getAllPlants = async () => {
  const existingPlants = await db.query.plants.findMany();
  if (existingPlants.length === 0) {
    console.log(
      "No plants in DB, we will attempt to populate with defaults..."
    );
    const newPlants: InsertPlant[] = DefaultSeeds;

    // const rows = getRandomIndices(GRID_HEIGHT, newPlants.length);
    // const columns = getRandomIndices(GRID_WIDTH, newPlants.length);

    await Promise.all(
      newPlants.map((p) => {
        const { commonName, description, properties, imageUrl, id } = p;
        // const rowIndex = rows[index];
        // const colIndex = columns[index];
        return db.insert(plants).values({
          id,
          commonName,
          description,
          properties,
          imageUrl,
          // rowIndex: rows[index],
          // columnIndex: columns[index],
        });
      })
    );

    return await db.query.plants.findMany();
  } else {
    return existingPlants;
  }
};

export const getUserGarden = async (userId: string): Promise<MyGarden> => {
  // const result  = await db.select().from(users).where(eq(users.id, userId));

  const user: UserWithGarden | undefined = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      myGarden: { with: { plantsInGarden: { with: { plant: true } } } },
    },
  });
  if (user) {
    console.log("full result:", JSON.stringify(user, null, 2));
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
      const rowIndexes = pickRandomIndexes(GRID_HEIGHT, defaultPlants.length);
      const colIndexes = pickRandomIndexes(GRID_WIDTH, defaultPlants.length);
      defaultPlants.forEach(async (plant, i) => {
        const rowIndex = rowIndexes[i];
        const colIndex = colIndexes[i];
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
      });

      const gardenWithPlants: MyGarden | undefined =
        await db.query.gardens.findFirst({
          where: eq(gardens.id, newGarden.id),
          with: {
            plantsInGarden: { with: { plant: true } },
          },
        });

      if (gardenWithPlants) {
        return gardenWithPlants;
      } else {
        throw Error("could not find garden just created");
      }

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

function getRandomIndices(max: number, count: number): number[] {
  const indices: Set<number> = new Set();
  while (indices.size < count) {
    const randomIndex = Math.floor(Math.random() * max);
    indices.add(randomIndex);
  }
  return Array.from(indices);
}

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
