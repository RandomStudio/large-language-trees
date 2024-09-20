import { getImageGenInfo, initImageGeneration } from "./image-gen.mts";

/** Should be identical to the version in
 * `/src/routes/api/plants/generate/+server.ts`
 */
interface BackgroundGenerateTextRequest {
  authorTop: string;
  authorBottom: string;
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
  authorTop: string;
  authorBottom: string;
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

// ----------------------------------------------------------------------------
// MAIN FUNCTION (REQUEST HANDLER)
// ----------------------------------------------------------------------------

export default async (req: Request) => {
  if (process.env.SIMULATE_OPENAI_FAILURES === "true") {
    console.warn("SIMULATE_OPENAI_FAILURES is enabled!");
  }

  const requestBody = (await req.json()) as BackgroundGenerateTextRequest;

  const { backgroundSecret, newPlantId } = requestBody;

  const realSecret = process.env.BACKGROUND_FN_SECRET;

  if (backgroundSecret !== realSecret) {
    console.error("Secrets do not match:", { backgroundSecret, realSecret });
    throw Error("Hey, that's not the correct super secret key!");
  }

  // Set origin string used for requests to OUR server...
  const useLocalApi = process.env.BACKGROUND_FN_USES_LOCAL_API;
  const serverOrigin = useLocalApi || "https://livinggarden.netlify.app";

  // First, text generation...
  try {
    const plantResponse = await initTextGeneration(requestBody, serverOrigin);

    // Next, get info from our server for the image generation...
    try {
      const info = await getImageGenInfo(
        serverOrigin,
        newPlantId,
        plantResponse["description"]
      );
      // Finally, use this info to initiate the image generation...
      await initImageGeneration(info, serverOrigin);
    } catch (getImageInfoError) {
      console.error(
        "There was an error getting image info: ",
        getImageInfoError
      );
      notifyCandidateTextFailed(
        newPlantId,
        requestBody.authorTop,
        requestBody.authorBottom,
        getImageInfoError.toString(),
        serverOrigin
      );
    }
  } catch (textGenError) {
    await notifyCandidateTextFailed(
      newPlantId,
      requestBody.authorTop,
      requestBody.authorBottom,
      textGenError.toString(),
      serverOrigin
    );
  }
};

// ----------------------------------------------------------------------------
// TEXT-GENERATION
// ----------------------------------------------------------------------------

const initTextGeneration = async (
  requestBody: BackgroundGenerateTextRequest,
  serverOrigin: string
): Promise<object> => {
  // if (process.env.SIMULATE_OPENAI_FAILURES === "true") {
  //   throw Error("simulated text generation error!");
  // }

  const {
    authorTop,
    authorBottom,
    model,
    messages,
    newPlantId,
    parent1Id,
    parent2Id
  } = requestBody;

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
      await notifyCandidateTextReady(
        newPlantId,
        {
          authorTop,
          authorBottom,
          contents: JSON.stringify(parsedPlant)
        },
        serverOrigin
      );

      return parsedPlant;
    } catch (e) {
      console.error(
        "Something went wrong parsing the new plant response: " + e
      );
      await notifyCandidateTextReady(
        newPlantId,
        {
          authorTop,
          authorBottom,
          errorMessage: "Failure on new plant response"
        },
        serverOrigin
      );
      throw Error("Failure on new plant response");
    }
  } else {
    const { status, statusText } = aiRes;
    console.error("Request failed with error:", { status, statusText });
    if (status == 429) {
      console.error("Rate limit detected");
    }
    throw Error("Request to OpenAI failed: " + statusText);
  }
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
  body: CandidateTextBody,
  serverOrigin: string
) => {
  const addPlantToDbRes = await fetch(
    `${serverOrigin}/api/plants/${plantId}/candidateText`,
    {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(body),
      headers: {
        origin: serverOrigin
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

const notifyCandidateTextFailed = async (
  plantId: string,
  authorTop: string,
  authorBottom: string,
  errorMessage: string,
  serverOrigin: string
) => {
  const jsonBody: CandidateTextBody = {
    authorTop,
    authorBottom,
    errorMessage
  };
  const updateCandidate = await fetch(
    `${serverOrigin}/api/plants/${plantId}/candidateText`,
    {
      method: "PATCH",
      mode: "cors",
      body: JSON.stringify(jsonBody),
      headers: {
        origin: serverOrigin
      }
    }
  );
  if (updateCandidate.status === 200 || updateCandidate.status === 201) {
    console.log("POSTed error message update OK");
  } else {
    const { statusText, status } = updateCandidate;
    console.error("Something went wrong when POSTing to our API endpoint:", {
      statusText,
      status
    });
    console.error(updateCandidate);
  }
};
