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

const main = async () => {
  const seedsText = await fs.readFile(
    path.resolve(process.cwd(), "./seeds.json"),
    {
      encoding: "utf-8",
    }
  );
  const seeds = JSON.parse(seedsText) as Plant[];

  const [plant1, plant2] = seeds;
  if (!plant1 || !plant2) {
    logger.error("Plant data doesn't exist!", { plant1, plant2 });
  }

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
          "I manage to cross-pollinate two plants. Don't worry about whether this is physically possible in real life, but feel free to speculate on the likely outcome. I will describe each plant by giving its common name followed by a brief description. With this information, try to come up with a plausible new plant that would result from the cross-pollination.\n\n" +
          `The first plant is named ${plant1.commonName}. ${plant1.description} \n\n` +
          `The second plant is named ${plant1.commonName}. ${plant1.description} \n\n` +
          `Describe the new plant that would result from the combination of these two. Simply give the common name followed by a short description that focusses on its appearance.`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  for (const res of completion.choices) {
    logger.debug(JSON.stringify(res));
    const formattedContent = JSON.stringify(res.message.content);
    console.log({ formattedContent }, typeof formattedContent);
  }
  logger.debug(completion.choices[0]);
};

// ================================================
// Kick off main process here
main();
