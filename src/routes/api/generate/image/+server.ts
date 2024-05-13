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

const URL_PREFIX = "https://random-the-garden.s3.eu-north-1.amazonaws.com";

export const POST: RequestHandler = async ({ request, params }) => {
  console.log({ PLACEHOLDER_IMAGES });
  const jsonBody = await request.json();
  const { id, description } = jsonBody;

  if (PLACEHOLDER_IMAGES === "true") {
    return json({ description, url: "/plants/placeholder.png" });
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

    if (LOCAL_FILES === "true") {
      try {
        await uploadLocal(fetchImage, id);
        return json({ description, url: `/uploads/${id}.png` });
      } catch (e) {
        console.error("Failed to upload to local filesystem:", e);
        return error(500);
      }
    } else {
      try {
        await streamToS3(fetchImage, id);
        return json({ description, url: URL_PREFIX + "/" + id + ".png" });
      } catch (e) {
        console.error("Error uploading to S3:", e);
        return error(500);
      }
    }
  }

  return error(500);
};

const buildImagePrompt = (description: string): string =>
  `I want you to generate an image, an accurate botanical sketch of a plant based on the description that follows:\n\n` +
  description;

const streamToS3 = async (fetchImage: Response, id: string) => {
  const stream = fetchImage.body;
  const filePath =
    path.resolve(process.cwd(), "static", "plants") + "/" + id + ".png";
  console.log("writing", filePath, "...");

  if (stream) {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      region: S3_REGION,
    });
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: S3_BUCKET,
        Key: `${id}.png`,
        Body: stream,
        ContentType: "image/png",
      },
    });
    const output = await upload.done();
    console.log("Uploaded OK to S3:", output);
  } else {
    throw Error("failed to get stream");
  }
};

const uploadLocal = async (fetchImage: Response, id: string) => {
  const filePath = path.resolve(
    process.cwd(),
    "static/",
    "uploads/",
    id + ".png",
  );
  console.log(`Writing to disk at "${filePath}"...`);
  await fs.writeFile(
    filePath,
    Buffer.from(await fetchImage.arrayBuffer()),
    "base64",
  );
};