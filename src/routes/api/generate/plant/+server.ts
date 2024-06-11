import { json, type RequestHandler } from "@sveltejs/kit";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "$env/static/private";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import type { Characteristics, InsertPlant, SelectPlant } from "$lib/types";
import { v4 as uuidv4 } from "uuid";

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as {
    prompt: ChatCompletionMessageParam[];
    parents: [SelectPlant, SelectPlant];
  };

  const { prompt, parents } = data;

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

      const parsedPlant = await parseNewPlant(formattedContent, [
        parents[0].id,
        parents[1].id
      ]);
      if (parsedPlant) {
        offspring = parsedPlant;
        console.log("Offspring:", offspring);
      } else {
        // offpsring will stay "null"
        console.error("Oops, couldn't parse the offspring text");
      }
    }
  }

  return json(offspring);
};

const parseNewPlant = async (
  text: string,
  parentIds: [string, string]
): Promise<InsertPlant> => {
  try {
    const cleanText = text
      .trim()
      .replaceAll("```json", "")
      .replaceAll("```", "");

    const json = JSON.parse(cleanText);

    if (json["commonName"] && json["description"] && json["properties"]) {
      console.log("JSON appears to have the valid fields");
      return {
        id: uuidv4(),
        parent1: parentIds[0],
        parent2: parentIds[1],
        commonName: json["commonName"],
        description: json["description"],
        properties: { ...(await interpretColours(json["properties"])) }
      };
    } else {
      throw Error("Fields missing from: " + JSON.stringify(Object.keys(json)));
    }
  } catch (e) {
    throw Error("Error parsing JSON: " + JSON.stringify({ e, text, json }));
  }
};

const interpretColours = async (
  originals: Characteristics
): Promise<Characteristics> => {
  const colourDescriptionKeys = Object.keys(originals).filter(
    (k) =>
      k.toLowerCase().includes("colour") || k.toLowerCase().includes("color")
  );
  console.log(
    colourDescriptionKeys.length,
    "colours to interpet...",
    colourDescriptionKeys,
    "from keys",
    Object.keys(originals)
  );
  if (colourDescriptionKeys.length == 0) {
    return originals;
  } else {
    let newObject = { ...originals };
    await Promise.all(
      colourDescriptionKeys.map(async (descriptionKey) => {
        const description = originals[descriptionKey] as string;
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
              role: "user",
              content: `Give me the hex string value for the colour "${description}". No other text in your response, please, just the hex string`
            }
          ],
          model: "gpt-3.5-turbo"
        });

        const response = completion.choices[0].message.content;
        if (response) {
          console.log(`interpreted colour "${description}" as ${response}`);
          if (response.includes("#") && response.length == 7) {
            newObject[descriptionKey + "RGB"] = response;
          } else {
            console.error("Does not look like a hex string value");
          }
        }
      })
    );
    return newObject;
  }
};
