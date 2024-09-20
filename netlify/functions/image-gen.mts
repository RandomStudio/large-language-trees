// ----------------------------------------------------------------------------
// IMAGE-GENERATION
// ----------------------------------------------------------------------------

/**
 * Should be identical to version in `src/routes/api/images/generate/+server.ts`
 */

export interface GenImageToServer {
  plantId: string;
  description: string;
}

/** Should be identical to the version in
 * `src/routes/api/images/generate/+server.ts`
 */
export interface GenImageToBackground {
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
 * `src/routes/api/plants/[id]/candidateImage`/+server.ts
 */
interface GenerateImageResultBody {
  url?: string | null;
  errorMessage?: string | null;
}

export const getImageGenInfo = async (
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

// ----------------------------------------------------------------------------
// IMAGE-GEN FUNCTIONS
// ----------------------------------------------------------------------------

export const initImageGeneration = async (
  requestBody: GenImageToBackground,
  serverOrigin: string
) => {
  const { model, fullPrompt, plantId } = requestBody;
  const generateAttempt1 = await tryGenerate(model, fullPrompt);
  // if (process.env.SIMULATE_OPENAI_FAILURES === "true") {
  //   throw Error("simulated image generation failure!");
  // }

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
      console.error("generateAttempt1 failed");
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
  // if (process.env.SIMULATE_OPENAI_FAILURES === "true") {
  //   throw Error("simulated image generation failure!");
  // }

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
    if (status === 400) {
      console.warn("Bad request detected; will try again");
      return {
        shouldRetry: true
      };
    }
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
