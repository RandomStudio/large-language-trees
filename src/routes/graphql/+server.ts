import { createHandler } from "graphql-http";
import { graphQlSchema } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * GraphQL proof of concept
 *
 * Example with linked/related entities:
 *
 * curl -X POST http://localhost:8888/graphql -H "Origin: http://localhost:8888" -H "Content-Type: application/json" -d '{"query": "query { users { id, mySeedbank { id, plantsInSeedbank { plantId, plant { commonName } } } } }"}' | jq
 *
 * Example, getting authorTopUser from plants (relation):
 *
 * curl -X POST http://localhost:8888/graphql -H "Origin: http://localhost:8888" -H "Content-Type: application/json" -d '{"query": "query { plants { id, commonName, authorTopUser { id, username } } }"}' | jq .
 */

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

  // return text(body || "");
  return json(JSON.parse(body || "{}"));
};

// const handler: RequestHandler = async ({ request }) => {
//   return graphQlHandler({
//     raw: request
//   });
// };

export const GET = endPoint;
export const HEAD = endPoint;
export const POST = endPoint;
