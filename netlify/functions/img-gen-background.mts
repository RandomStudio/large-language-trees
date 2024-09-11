/** Should be identical to the version in
 * `src/routes/api/images/generate/+server.ts`
 */
interface BackgroundGenerateImageRequest {
  plantId: string;
  fullPrompt: string;
  model: string;
  backgroundSecret: string;
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

export default async (req: Request) => {
  const requestBody = (await req.json()) as BackgroundGenerateImageRequest;
  const { fullPrompt, backgroundSecret, plantId, model } = requestBody;

  const realSecret = process.env.BACKGROUND_FN_SECRET;

  if (backgroundSecret !== realSecret) {
    console.error("Secrets do not match:", { backgroundSecret, realSecret });
    throw Error("Hey, that's not the correct super secret key!");
  }

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
        await notifyCandidateImageFailed("Generate attempt #2 failed", plantId);
        throw Error("Generate attempt #2 failed");
      }
    } else {
      console.error("");
      await notifyCandidateImageFailed(
        "Generate attempt indicated shouldRetry==false; complete failure",
        plantId
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
  plantId: string
) => {
  const useLocalApi = process.env.BACKGROUND_FN_USES_LOCAL_API;

  const origin = useLocalApi || "https://livinggarden.netlify.app";
  const jsonBody: GenerateImageResultBody = {
    errorMessage
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
