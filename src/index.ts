import defaults from "./defaults";
import parse from "parse-strings-in-object";
import rc from "rc";
import { getLogger } from "log4js";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { Plant } from "./types";
import { v4 as uuidv4 } from "uuid";

const appName = defaults.appName;

const config: typeof defaults = parse(rc(appName, defaults));

const logger = getLogger(appName);
logger.level = config.loglevel;

logger.info("started with config", config);
logger.debug("Debug logging enabled; output could be verbose!");

const pick = <T>(arr: T[]): T => {
  const index = Math.round(Math.random() * (arr.length - 1));
  return arr[index];
};

const pickRandomParents = (seeds: Plant[]): [Plant, Plant] => {
  if (seeds.length < 2) {
    throw Error("Input list must have at least 2 entries");
  }
  const first = pick(seeds);
  let second = pick(seeds);
  while (second.id === first.id) {
    second = pick(seeds);
  }
  return [first, second];
};

const parseNewPlant = (
  text: string,
  parents: [string, string]
): Plant | null => {
  const json = JSON.parse(text);
  if (json["commonName"] && json["description"]) {
    logger.info("JSON appears to have the valid fields");
    return {
      id: uuidv4(),
      parents,
      commonName: json["commonName"],
      description: json["description"],
    };
  } else {
    logger.error("Fields missing:", Object.keys(json));
    return null;
  }
  // const sentences = text.split(".");
  // if (sentences.length <= 1) {
  //   throw Error("Not enough sentences! " + sentences.length);
  // }
  // const plantName = sentences[0].match(/\\(".*?"\\)/g);
  // if (plantName) {
  //   const name = plantName.at(0);
  //   if (name) {
  //     logger.debug("Found plant name:", name);
  //     const descriptionSentences = sentences.slice(1);
  //     const description = descriptionSentences.join("");
  //     logger.debug("New description:", description);
  //     return {
  //       id: uuidv4(),
  //       parents,
  //       commonName: name,
  //       description,
  //     };
  //   }
  // }
  // return null;
};

const main = async () => {
  const jsonPath = path.resolve(process.cwd(), "./seeds.json");
  const seedsText = await fs.readFile(jsonPath, {
    encoding: "utf-8",
  });
  const seeds = JSON.parse(seedsText) as Plant[];

  const [plant1, plant2] = pickRandomParents(seeds);
  logger.debug({ plant1, plant2 });

  const openai = new OpenAI();
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a knowledgeable botanist with a flair for the imagination.",
      },
      {
        role: "user",
        content:
          'I manage to cross-pollinate two plants. Don\'t worry about whether this is physically possible in real life, but feel free to speculate on the likely outcome. I will describe each plant by giving its common name and by a brief description. This will be given in JSON form, with the keys "commonName" and "description" in both cases. With the information about the two parent plants, try to come up with a plausible new plant that would result from the cross-pollination.\n\n' +
          "First plant JSON:\n" +
          JSON.stringify(
            { commonName: plant1.commonName, description: plant1.description },
            null,
            2
          ) +
          "\n\n" +
          "Second plant JSON:\n" +
          JSON.stringify(
            { commonName: plant2.commonName, description: plant2.description },
            null,
            2
          ) +
          "\n\n" +
          'Describe the new plant that would result from the combination of these two. Please give the result in the same JSON format, i.e. with a field "commonName" for the common name and "description" for the description. Do not include any text besides the JSON in your response.',
      },
    ],
    model: "gpt-3.5-turbo",
  });

  logger.debug(completion.choices[0]);

  for (const res of completion.choices) {
    logger.debug(JSON.stringify(res));
    const formattedContent = res.message.content || "{}";

    const offspring = parseNewPlant(formattedContent, [plant1.id, plant2.id]);
    if (offspring) {
      logger.info("Offspring:", offspring);

      const garden = [...seeds, offspring];

      await fs.writeFile(jsonPath, JSON.stringify(garden, null, 2));
    } else {
      throw Error("Oops, couldn't parse the offspring text");
    }
  }
};

// ================================================
// Kick off main process here
main();
