import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  OPENAI_API_KEY,
  S3_BUCKET,
  S3_REGION,
  LOCAL_FILES,
  PLACEHOLDER_IMAGES,
} from "$env/static/private";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import OpenAI from "openai";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3, uploadLocal } from "$lib/server/images";
import type { GeneratedImageResult } from "$lib/types";
import { URL_PREFIX } from "../../../../defaults/constants";

export const POST: RequestHandler = async ({ request }) => {
  console.log({ PLACEHOLDER_IMAGES });
  const jsonBody = await request.json();
  const { description } = jsonBody;

  if (PLACEHOLDER_IMAGES === "true") {
    const jsonResponse: GeneratedImageResult = {
      url: "/plants/placeholder.png",
    };
    return json(jsonResponse, { status: 200 });
  }

  const prompt = buildImagePrompt(description);
  console.log(`Fetch image with prompt "${prompt}" ...`);

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
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
        };
        return json(jsonResponse, { status: 200 });
      } catch (e) {
        console.error("Failed to upload to local filesystem:", e);
        return error(500);
      }
    } else {
      try {
        await uploadToS3(fetchImage, baseName);
        const jsonResponse: GeneratedImageResult = {
          url: URL_PREFIX + "/" + baseName + ".png",
        };

        return json(jsonResponse, { status: 200 });
      } catch (e) {
        console.error("Error uploading to S3:", e);
        return error(500);
      }
    }
  }

  return error(500);
};

const buildImagePrompt = (description: string): string =>
  `I want you to generate a pixelart style image, with a white background, based on the description that follows:\n\n` +
  description;
