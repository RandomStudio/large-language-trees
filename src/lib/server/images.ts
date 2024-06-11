import {
  AWS_ACCESS_KEY_ID_S3,
  AWS_SECRET_ACCESS_KEY_S3,
  S3_BUCKET,
  S3_REGION
} from "$env/static/private";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import path from "path";
import fs from "fs/promises";

export const uploadToS3 = async (fetchImage: Response, id: string) => {
  const stream = fetchImage.body;
  const filePath =
    path.resolve(process.cwd(), "static", "plants") + "/" + id + ".png";
  console.log("writing", filePath, "...");

  if (stream) {
    await streamToS3(id, stream);
  } else {
    throw Error("failed to get stream");
  }
};

export const uploadLocal = async (fetchImage: Response, basename: string) => {
  const filePath = path.resolve(
    process.cwd(),
    "static/",
    "uploads/",
    basename + ".png"
  );
  console.log(`Writing to disk at "${filePath}"...`);
  await fs.writeFile(
    filePath,
    Buffer.from(await fetchImage.arrayBuffer()),
    "base64"
  );
};
export async function streamToS3(
  baseName: string,
  stream: ReadableStream<Uint8Array>
) {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID_S3,
      secretAccessKey: AWS_SECRET_ACCESS_KEY_S3
    },
    region: S3_REGION
  });
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: S3_BUCKET,
      Key: `${baseName}.png`,
      Body: stream,
      ContentType: "image/png"
    }
  });
  const output = await upload.done();
  console.log("Uploaded OK to S3:", output);
}
