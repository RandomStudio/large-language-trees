import {
  OPENAI_API_KEY,
  LOCAL_FILES,
  PLACEHOLDER_IMAGES,
  USE_NETLIFY_BACKGROUND_FN,
  BACKGROUND_FN_SECRET
} from "$env/static/private";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3, uploadLocal } from "$lib/server/images";
import type { GeneratedImageResult, PromptConfig } from "$lib/types";
import { URL_PREFIX } from "../../../../defaults/constants";
import { buildImagePrompt } from "$lib/promptUtils";
import { getPromptSettings } from "$lib/server/promptSettings";
import type { GenerateImageRequest } from "./types";

export const POST: RequestHandler = async ({ request }) => {
  console.log({ PLACEHOLDER_IMAGES });
  const jsonBody = (await request.json()) as GenerateImageRequest;
  const { description, plantId, model, instructions } = jsonBody;

  if (PLACEHOLDER_IMAGES === "true") {
    const jsonResponse: GeneratedImageResult = {
      pleaseWait: false,
      url: "/plants/placeholder.png"
    };
    return json(jsonResponse, { status: 200 });
  }

  const promptSettings: PromptConfig = await getPromptSettings();

  const prompt = buildImagePrompt(
    instructions || promptSettings.image.instructions,
    description
  );

  if (USE_NETLIFY_BACKGROUND_FN === "true") {
    console.log(
      `Will initiate (background) request for image generation with prompt "${prompt}" ...`
    );
    await fetch(
      "https://livinggarden.netlify.app/.netlify/functions/img-gen-background",
      {
        method: "POST",
        body: JSON.stringify({
          prompt,
          backgroundSecret: BACKGROUND_FN_SECRET,
          plantId,
          model: model || promptSettings.image.model
        })
      }
    );

    const jsonResponse: GeneratedImageResult = { pleaseWait: true, url: null };
    return json(jsonResponse, { status: 200 });
  } else {
    console.warn(
      "USE_NETLIFY_BACKGROUND_FN is disabled; will do request from this NodeJS server"
    );
    return await doRequestLocally(prompt, model || promptSettings.image.model);
  }
};

interface ResponseError {
  status: any;
  data: any;
}
interface OpenAIError {
  response?: ResponseError;
  message?: string;
}

const doRequestLocally = async (prompt: string, model: string) => {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const baseName = uuidv4();

  try {
    const generatedUrl1 = await tryGenerate(openai, model, prompt);
    const finalUrl1 = await doUpload(generatedUrl1, baseName);

    const jsonResponse: GeneratedImageResult = {
      url: finalUrl1,
      pleaseWait: false
    };
    return json(jsonResponse, { status: 200 });
  } catch (attempt1Error) {
    console.error("OpenAI generation error!", JSON.stringify(attempt1Error));
    const e = attempt1Error as OpenAIError;
    if (e.message && e.message.includes("Rate limit exceeded")) {
      console.warn("Detected: Rate limited exceeded; will try with dall-e-2");
      try {
        const generatedUrl2 = await tryGenerate(openai, "dall-e-2", prompt);
        const finalUrl2 = await doUpload(generatedUrl2, baseName);
        const jsonResponse: GeneratedImageResult = {
          url: finalUrl2,
          pleaseWait: false
        };
        return json(jsonResponse, { status: 200 });
      } catch (attempt2Error) {
        console.error("Attempt 2 also failed: " + attempt2Error);
        return error(500);
      }
    } else {
      console.error("Some other error!", e);
      return error(500);
    }
  }
};

const tryGenerate = async (
  openai: OpenAI,
  model: string,
  prompt: string
): Promise<string> => {
  console.log(
    `tryGenerate with model "${model}" and prompt:\n"${prompt}"\n ...`
  );
  const response = await openai.images.generate({
    model,
    prompt,
    n: 1,
    size: "1024x1024"
  });

  const generatedUrl = response.data[0].url;

  if (generatedUrl) {
    return generatedUrl;
  } else {
    throw Error("No url retrieved");
  }
};

const doUpload = async (
  generatedUrl: string,
  baseName: string
): Promise<string> => {
  const fetchImage = await fetch(generatedUrl);

  if (LOCAL_FILES === "true") {
    try {
      await uploadLocal(fetchImage, baseName);
      return `/uploads/${baseName}.png`;
    } catch (e) {
      console.error("Failed to upload to local filesystem:", e);
      throw Error("error uploading to local filesystem");
    }
  } else {
    try {
      await uploadToS3(fetchImage, baseName);

      return URL_PREFIX + "/" + baseName + ".png";
    } catch (e) {
      console.error("Error uploading to S3:", e);
      throw Error("error uploading to S3");
    }
  }
};
