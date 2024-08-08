/** Should be identical to the version in
 * `/src/routes/api/plants/generate/+server.ts`
 */
interface BackgroundGenerateTextRequest {
  userId: string;
  newPlantId: string;
  parent1Id: string;
  parent2Id: string;
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  backgroundSecret: string;
}

/** Should be identical to the interface in
 * `src/routes/api/plants/[id]/candidateText/+server.ts`
 */
interface CandidateTextBody {
  userId: string;
  contents?: string;
  errorMessage?: string;
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

  const {
    userId,
    model,
    messages,
    backgroundSecret,
    newPlantId,
    parent1Id,
    parent2Id
  } = requestBody;

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
    },
    body: JSON.stringify({
      response_format: { type: "json_object" },
      model,
      messages
    })
  });

  console.log("Got response from OpenAI API:", aiRes);

  if (aiRes.status === 200) {
    const jsonResponse = (await aiRes.json()) as ChatResponse;

    const message = jsonResponse.choices[0].message.content;

    try {
      const parsedPlant = parseNewPlant(
        newPlantId,
        message,
        parent1Id,
        parent2Id
      );

      console.log("New plant as parsed:", JSON.stringify(parsedPlant, null, 2));

      // Insert the candidate plant into the generated_text table...
      await notifyCandidateTextReady(newPlantId, {
        userId,
        contents: JSON.stringify(parsedPlant)
      });
    } catch (e) {
      console.error(
        "Something went wrong parsing the new plant response: " + e
      );
      await notifyCandidateTextReady(newPlantId, {
        userId,
        errorMessage: "Failure on new plant response"
      });
    }
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
  newPlantId: string,
  text: string,
  parent1Id: string,
  parent2Id: string
): object => {
  try {
    const cleanText = text.trim().replace(/g\n/g, "");

    const json = JSON.parse(cleanText);

    if (json["commonName"] && json["description"] && json["properties"]) {
      console.log("JSON appears to have the valid fields");
      return {
        id: newPlantId,
        parent1: parent1Id,
        parent2: parent2Id,
        commonName: json["commonName"],
        description: json["description"],
        properties: { ...json["properties"] }
      };
    } else {
      throw Error("Fields missing from: " + JSON.stringify(Object.keys(json)));
    }
  } catch (e) {
    throw Error("Error parsing JSON: " + JSON.stringify({ e, text }));
  }
};

const notifyCandidateTextReady = async (
  plantId: string,
  body: CandidateTextBody
) => {
  const useLocalApi = process.env.BACKGROUND_FN_USES_LOCAL_API;

  const origin = useLocalApi || "https://livinggarden.netlify.app";
  console.log("POST to", origin);

  const addPlantToDbRes = await fetch(
    `${origin}/api/plants/${plantId}/candidateText`,
    {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(body),
      headers: {
        origin
      }
    }
  );
  if (addPlantToDbRes.status === 200 || addPlantToDbRes.status === 201) {
    console.log("Success POSTing to our endpoint");
    if (body.errorMessage) {
      console.error("There was an error:", body.errorMessage);
    }
  } else {
    const { statusText, status } = addPlantToDbRes;
    console.error("Something went wrong when POSTing to our API endpoint:", {
      statusText,
      status
    });
    console.error(addPlantToDbRes);
  }
};
