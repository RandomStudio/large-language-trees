import {
  AWS_ACCESS_KEY_ID_S3,
  AWS_SECRET_ACCESS_KEY_S3,
  OPENAI_API_KEY,
  S3_BUCKET,
  S3_REGION,
  LOCAL_FILES,
  PLACEHOLDER_IMAGES,
  USE_NETLIFY_BACKGROUND_FN,
  BACKGROUND_FN_SECRET
} from "$env/static/private";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3, uploadLocal } from "$lib/server/images";
import type { GenerateImageRequest, GeneratedImageResult } from "$lib/types";
import { URL_PREFIX } from "../../../../defaults/constants";
import DefaultPrompt from "../../../../defaults/prompt-config";
import { buildImagePrompt } from "$lib/promptUtils";

export const POST: RequestHandler = async ({ request }) => {
  console.log({ PLACEHOLDER_IMAGES });
  const jsonBody = (await request.json()) as GenerateImageRequest;
  const { description, plantId } = jsonBody;

  if (PLACEHOLDER_IMAGES === "true") {
    const jsonResponse: GeneratedImageResult = {
      pleaseWait: false,
      url: "/plants/placeholder.png"
    };
    return json(jsonResponse, { status: 200 });
  }

  const prompt = buildImagePrompt(
    DefaultPrompt.image.instructions,
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
          plantId
        })
      }
    );

    const jsonResponse: GeneratedImageResult = { pleaseWait: true, url: null };
    return json(jsonResponse, { status: 200 });
  } else {
    console.warn(
      "USE_NETLIFY_BACKGROUND_FN is disabled; will do request from this NodeJS server"
    );
    return await doRequestLocally(prompt);
  }
};

const doRequestLocally = async (prompt: string) => {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024"
  });
  console.log("Got image result:", response);

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
