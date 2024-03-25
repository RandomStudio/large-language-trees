import { OPENAI_API_KEY } from "$env/static/private";
import { json, type RequestHandler } from "@sveltejs/kit";
import OpenAI from "openai";
import fs from "fs/promises";
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
    const buffer = await fetchImage.arrayBuffer();
    const filePath =
      path.resolve(process.cwd(), "static", "plants") + "/" + id + ".png";
    console.log("writing", filePath, "...");
    await fs.writeFile(filePath, Buffer.from(buffer), "base64");
    console.log("wrote ok");
    return json({ description, url });
  } else {
    return json({});
  }
};

const buildImagePrompt = (description: string): string =>
  `I want you to generate an image, an accurate botanical sketch of a plant based on the description that follows:\n\n` +
  description;
