import { streamToS3, uploadToS3 } from "$lib/server/images";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, params }) => {
  const id = params["id"];
  console.log("POST upload/images with plantId", id);

  if (id) {
    const data = await request.formData();
    const imageFile = data.get("img");

    if (imageFile) {
      console.log(imageFile);

      const stream = (imageFile as Blob).stream();

      await streamToS3(id, stream);
      return json({ status: 201 });
    } else {
      throw Error("where is the img part?");
    }
  } else {
    throw Error("where is the plant ID?");
  }
};
