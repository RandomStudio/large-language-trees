import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  OPENAI_API_KEY,
  S3_BUCKET,
  S3_REGION,
} from "$env/static/private";
import { json, type RequestHandler } from "@sveltejs/kit";
import { Upload } from "@aws-sdk/lib-storage";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import OpenAI from "openai";
import path from "path";

export const POST: RequestHandler = async ({ request, params }) => {
  const jsonBody = await request.json();
  const { id, description } = jsonBody;

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

  const { url } = response.data[0];

  if (url) {
    const fetchImage = await fetch(url);
    const stream = fetchImage.body;
    // const buffer = await fetchImage.arrayBuffer();
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
          Key: `${id}`,
          Body: stream,
        },
      });
      try {
        await upload.done();
      } catch (e) {
        console.error("Error uploading to S3:", e);
      }

      console.log("wrote ok");
      return json({ description, url });
    } else {
      return json({});
    }
  } else {
    return json({});
  }
};

const buildImagePrompt = (description: string): string =>
  `I want you to generate an image, an accurate botanical sketch of a plant based on the description that follows:\n\n` +
  description;
