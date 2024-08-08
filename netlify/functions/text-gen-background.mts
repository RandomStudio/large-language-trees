interface BackgroundGenerateTextRequest {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  backgroundSecret: string;
}

/** As per https://platform.openai.com/docs/guides/chat-completions/response-format */
interface ChatResponse {
  choices: {
    finish_reason: string;
    index: number;
    message: {
      content: string;
      role: string;
    };
    logprobs: any;
  }[];
  created: string;
  id: string;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

export default async (req: Request) => {
  const requestBody = (await req.json()) as BackgroundGenerateTextRequest;

  const { model, messages, backgroundSecret } = requestBody;

  const realSecret = process.env.BACKGROUND_FN_SECRET;

  if (backgroundSecret !== realSecret) {
    console.error("Secrets do not match:", { backgroundSecret, realSecret });
    throw Error("Hey, that's not the correct super secret key!");
  }

  const apiKey = process.env.OPENAI_API_KEY;

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    }
  });

  console.log("Got response from OpenAI API:", aiRes);

  if (aiRes.status === 200) {
    const jsonResponse = await aiRes.json() as ChatResponse;

    const message = jsonResponse.choices[0].message.content;

    const parsedPlant =     

  } else {
    const { status, statusText } = aiRes;
    console.error("Request failed with error:", { status, statusText });
    if (status === 429) {
      console.warn("Rate limit detected");
    }
    throw Error("Request to OpenAI failed: " + statusText);
  }

  // TODO: include "response format" in request
};

const parseNewPlant = (
  text: string,
  parentIds: [string, string]
): object => {
  try {
    const cleanText = text.trim().replace(/g\n/g, "");

    const json = JSON.parse(cleanText);

    if (json["commonName"] && json["description"] && json["properties"]) {
      console.log("JSON appears to have the valid fields");
      return {
        id: uuidv4(),
        parent1: parentIds[0],
        parent2: parentIds[1],
        commonName: json["commonName"],
        description: json["description"],
        properties: { ...json["properties"] }
      };
    } else {
      throw Error("Fields missing from: " + JSON.stringify(Object.keys(json)));
    }
  } catch (e) {
    throw Error("Error parsing JSON: " + JSON.stringify({ e, text, json }));
  }
};
