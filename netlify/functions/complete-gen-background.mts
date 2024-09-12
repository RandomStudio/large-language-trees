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
  const plantResponse = await initTextGeneration(requestBody, serverOrigin);

  // Next, get info from our server for the image generation...
  const info = await getImageGenInfo(
    serverOrigin,
    newPlantId,
    plantResponse["description"]
  );

  // Finally, use this info to initiate the image generation...
  await initImageGeneration(info, serverOrigin);
};

const getImageGenInfo = async (
  serverOrigin: string,
  plantId: string,
  description: string
): Promise<GenImageToBackground> => {
  const jsonBody: GenImageToServer = {
    plantId,
    description
  };

  const res = await fetch(`${serverOrigin}/api/images/generate`, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(jsonBody),
    headers: {
      origin: serverOrigin
    }
  });

  const info = (await res.json()) as GenImageToBackground;

  return info;
};

const initTextGeneration = async (
  requestBody: BackgroundGenerateTextRequest,
  serverOrigin: string
): Promise<object> => {
  const { userId, model, messages, newPlantId, parent1Id, parent2Id } =
    requestBody;

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
          userId,
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
          userId,
          errorMessage: "Failure on new plant response"
        },
        serverOrigin
      );
      throw Error("Failure on new plant response");
    }
  } else {
    const { status, statusText } = aiRes;
    console.error("Request failed with error:", { status, statusText });
    if (status === 429) {
      console.warn("Rate limit detected");
    }
    throw Error("Request to OpenAI failed: " + statusText);
  }
};

// ----------------------------------------------------------------------------
// TEXT-GENERATION
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// IMAGE-GENERATION
// ----------------------------------------------------------------------------

interface GenImageToServer {
  plantId: string;
  description: string;
}

/** Should be identical to the version in
 * `src/routes/api/images/generate/+server.ts`
 */
interface GenImageToBackground {
  plantId: string;
  fullPrompt: string;
  model: string;
}

interface GenerateResult {
  url?: string;
  shouldRetry: boolean;
}

/**
 * The JSON body that is POSTed to our own api
 * at /api/plants/[id]/candidateImage
 *
 * Should be identical to the version in
 * `src/routes/api/plants/[id]/candidateImage`
 */
interface GenerateImageResultBody {
  url?: string | null;
  errorMessage?: string | null;
}

const initImageGeneration = async (
  requestBody: GenImageToBackground,
  serverOrigin: string
) => {
  const { model, fullPrompt, plantId } = requestBody;
  const generateAttempt1 = await tryGenerate(model, fullPrompt);
  if (generateAttempt1.url) {
    console.log("Success from generate attempt #1, url", generateAttempt1.url);
    await notifyCandidateImageReady(generateAttempt1.url, plantId);
  } else {
    if (generateAttempt1.shouldRetry) {
      console.warn(
        "Generate attempt #1 indicated shouldRetry==true; fallback to dall-e-2 generation..."
      );
      const generateAttempt2 = await tryGenerate("dall-e-2", fullPrompt);
      if (generateAttempt2.url) {
        console.log(
          "Success from generate attempt #2, url",
          generateAttempt2.url
        );
        await notifyCandidateImageReady(generateAttempt2.url, plantId);
      } else {
        await notifyCandidateImageFailed(
          "Generate attempt #2 failed",
          plantId,
          serverOrigin
        );
        throw Error("Generate attempt #2 failed");
      }
    } else {
      console.error("");
      await notifyCandidateImageFailed(
        "Generate attempt indicated shouldRetry==false; complete failure",
        plantId,
        serverOrigin
      );
      throw Error(
        "Generate attempt indicated shouldRetry==false; complete failure"
      );
    }
  }
};

const tryGenerate = async (
  model: string,
  prompt: string
): Promise<GenerateResult> => {
  const apiKey = process.env.OPENAI_API_KEY;

  console.log(
    `Using model "${model}" to generate image with prompt\n"${prompt}"...`
  );

  const jsonBody = {
    model,
    prompt,
    n: 1,
    size: "1024x1024"
  };

  const aiRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(jsonBody)
  });

  console.log("Got response from OpenAI API:", aiRes);

  if (aiRes.status === 200) {
    const jsonResponse = await aiRes.json();
    const url = jsonResponse.data[0].url as string;
    return {
      url,
      shouldRetry: false
    };
  } else {
    const { status, statusText } = aiRes;
    console.error("Request failed with error:", { status, statusText });
    if (status === 429) {
      console.warn("Rate limit detected; will try again");
      return {
        shouldRetry: true
      };
    }
    return {
      shouldRetry: false
    };
  }
};

const notifyCandidateImageFailed = async (
  errorMessage: string,
  plantId: string,
  serverOrigin: string
) => {
  const useLocalApi = process.env.BACKGROUND_FN_USES_LOCAL_API;

  const jsonBody: GenerateImageResultBody = {
    errorMessage
  };
  const addImageToDbRes = await fetch(
    `${serverOrigin}/api/plants/${plantId}/candidateImage`,
    {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(jsonBody),
      headers: {
        origin: serverOrigin
      }
    }
  );
  if (addImageToDbRes.status === 200 || addImageToDbRes.status === 201) {
    console.log("POSTed error message update OK");
  } else {
    const { statusText, status } = addImageToDbRes;
    console.error("Something went wrong when POSTing to our API endpoint:", {
      statusText,
      status
    });
    console.error(addImageToDbRes);
  }
};

const notifyCandidateImageReady = async (url: string, plantId: string) => {
  const useLocalApi = process.env.BACKGROUND_FN_USES_LOCAL_API;

  const origin = useLocalApi || "https://livinggarden.netlify.app";
  console.log("POST to", origin);

  const jsonBody: GenerateImageResultBody = {
    url
  };

  const addImageToDbRes = await fetch(
    `${origin}/api/plants/${plantId}/candidateImage`,
    {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(jsonBody),
      headers: {
        origin
      }
    }
  );
  if (addImageToDbRes.status === 200 || addImageToDbRes.status === 201) {
    console.log("Success!");
  } else {
    const { statusText, status } = addImageToDbRes;
    console.error("Something went wrong when POSTing to our API endpoint:", {
      statusText,
      status
    });
    console.error(addImageToDbRes);
  }
};
