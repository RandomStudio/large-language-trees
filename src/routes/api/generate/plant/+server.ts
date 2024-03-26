import { json, type RequestHandler } from "@sveltejs/kit";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "$env/static/private";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import type { Plant } from "../../../../types";

export const POST: RequestHandler = async ({ request }) => {
  const data = (await request.json()) as {
    prompt: ChatCompletionMessageParam[];
    parents: [Plant, Plant];
  };

  const { prompt, parents } = data;

  let offspring: Plant | null = null;

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

      offspring = parseNewPlant(formattedContent, [
        parents[0].id,
        parents[1].id,
      ]);
      if (offspring) {
        console.log("Offspring:", offspring);
      } else {
        throw Error("Oops, couldn't parse the offspring text");
      }
    }
  }

  return json(offspring);
};

const parseNewPlant = (
  text: string,
  parentIds: [number, number]
): Plant | null => {
  const json = JSON.parse(text);
  if (json["commonName"] && json["description"] && json["properties"]) {
    console.log("JSON appears to have the valid fields");
    return {
      id: 0, // will be autogenerated, anyway
      parent1: parentIds[0],
      parent2: parentIds[1],
      commonName: json["commonName"],
      description: json["description"],
      properties: { ...json["properties"] },
    };
  } else {
    throw Error("Fields missing from: " + JSON.stringify(Object.keys(json)));
  }
};
