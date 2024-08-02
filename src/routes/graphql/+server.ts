import { createHandler } from "graphql-http";
import { graphQlSchema } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";

const handler = createHandler({ schema: graphQlSchema });

// const endPoint: RequestHandler = async () => json({ foo: "bar" });

const endPoint: RequestHandler = async ({ request, url }) => {
  // request.body
  const incoming = await request.json();
  console.log({ incoming });

  const [body, init] = await handler({
    url: url.href,
    method: request.method,
    headers: request.headers,
    body: incoming,
    raw: request,
    context: undefined
  });

  console.log({ body, init });

  return json(body);
};

// const handler: RequestHandler = async ({ request }) => {
//   return graphQlHandler({
//     raw: request
//   });
// };

export const GET = endPoint;
export const HEAD = endPoint;
export const POST = endPoint;
