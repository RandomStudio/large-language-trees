import { streamToS3 } from "$lib/server/images";
import type { ImageUploadResult } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { URL_PREFIX } from "$lib/constants";

export const POST: RequestHandler = async ({ request }) => {
  console.log("POST upload/images with image Blob in Form");

  const data = await request.formData();
  const imageFile = data.get("img");

  if (imageFile) {
    console.log(imageFile);

    const stream = (imageFile as Blob).stream();

    const baseName = uuidv4();

    await streamToS3(baseName, stream);
    const jsonResponse: ImageUploadResult = {
      url: URL_PREFIX + "/" + baseName + ".png"
    };
    return json(jsonResponse, { status: 201 });
  } else {
    throw Error("where is the img part?");
  }
};
