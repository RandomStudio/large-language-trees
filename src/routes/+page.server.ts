import { seeds } from "./seeds";
import { OPENAI_API_KEY } from "$env/static/private";
import OpenAI from "openai";
import type { Plant } from "./types";
import { v4 as uuidv4 } from "uuid";
import type { Actions } from "./$types";

let seedsInMemory: Plant[] | null = null;

export function load() {
  console.log("loading!");
  if (seedsInMemory === null) {
    console.log("Add from original");
    seedsInMemory = [...seeds];
  } else {
    console.log("Was already populated with", seedsInMemory.length, "entries");
  }
  return { seeds: seedsInMemory };
}

export const actions = {
  default: async ({ request }) => {
    console.log("Start with", seedsInMemory?.length, "seeds");
    const data = await request.formData();

    const [id1, id2] = [data.get("parent1"), data.get("parent2")] as [
      string,
      string,
    ];

    console.log("looking for ids", id1, id2);

    const plant1 = seedsInMemory?.find((s) => s.id === id1);
    const plant2 = seedsInMemory?.find((s) => s.id === id2);

    if (plant1 === undefined || plant2 === undefined) {
      console.error(data);
      throw Error("Where are the parents?");
    }

    console.log("got request", plant1.commonName, "x", plant2.commonName);

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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
              {
                commonName: plant1.commonName,
                description: plant1.description,
              },
              null,
              2,
            ) +
            "\n\n" +
            "Second plant JSON:\n" +
            JSON.stringify(
              {
                commonName: plant2.commonName,
                description: plant2.description,
              },
              null,
              2,
            ) +
            "\n\n" +
            'Describe the new plant that would result from the combination of these two. The new common name should not just be a simple combination of the two parent plant names - try to come up with a strange sounding name. Please give the result in the same JSON format, i.e. with a field "commonName" for the common name and "description" for the description. Do not include any text besides the JSON in your response.',
        },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log("response:", completion.choices);

    for (const res of completion.choices) {
      console.log(JSON.stringify(res));
      const formattedContent = res.message.content || "{}";

      const offspring = parseNewPlant(formattedContent, [plant1.id, plant2.id]);
      if (offspring) {
        console.log("Offspring:", offspring);

        seedsInMemory = [...(seedsInMemory || seeds), offspring];
        // const jsonOutputPath = path.resolve(process.cwd(), config.seedsOut);
        // await fs.writeFile(jsonOutputPath, JSON.stringify(garden, null, 2));
      } else {
        throw Error("Oops, couldn't parse the offspring text");
      }
    }
  },
} satisfies Actions;

const parseNewPlant = (
  text: string,
  parents: [string, string],
): Plant | null => {
  const json = JSON.parse(text);
  if (json["commonName"] && json["description"]) {
    console.log("JSON appears to have the valid fields");
    return {
      id: uuidv4(),
      parents,
      commonName: json["commonName"],
      description: json["description"],
    };
  } else {
    throw Error("Fields missing from: " + JSON.stringify(Object.keys(json)));
  }
};
