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

const doRequestLocally = async (prompt: string, model: string) => {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  console.log("Generating using model", model, "and prompt", prompt);

  const startTime = Date.now();

  const response = await openai.images.generate({
    model,
    prompt,
    n: 1,
    size: "1024x1024"
  });
  const elapsed = Date.now() - startTime;
  console.log(
    `After ${(elapsed / 1000).toFixed(1)}s, got image result "${JSON.stringify(
      response
    )}"`
  );

  const generatedUrl = response.data[0].url;

  if (generatedUrl) {
    const fetchImage = await fetch(generatedUrl);

    const baseName = uuidv4();

    if (LOCAL_FILES === "true") {
      try {
        await uploadLocal(fetchImage, baseName);
        const jsonResponse: GeneratedImageResult = {
          url: `/uploads/${baseName}.png`,
          pleaseWait: false
        };
        return json(jsonResponse, { status: 200 });
      } catch (e) {
        console.error("Failed to upload to local filesystem:", e);
        return error(500, "error uploading to local filesystem");
      }
    } else {
      try {
        await uploadToS3(fetchImage, baseName);
        const jsonResponse: GeneratedImageResult = {
          url: URL_PREFIX + "/" + baseName + ".png",
          pleaseWait: false
        };

        return json(jsonResponse, { status: 200 });
      } catch (e) {
        console.error("Error uploading to S3:", e);
        return error(500, "error uploading to S3");
      }
    }
  } else {
    return error(500, "No generated URL returned");
  }
};
