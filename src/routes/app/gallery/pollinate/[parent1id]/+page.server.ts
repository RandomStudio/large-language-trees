// import { getUserGarden, getUserSeeds } from "$lib/server";
// import { fail, redirect, type Actions } from "@sveltejs/kit";
// import { lucia } from "$lib/server/auth";
// import { db } from "$lib/server/db";
// import { eq } from "drizzle-orm";
// import { users } from "$lib/server/schema";
// import type { PageServerLoad } from "./$types";
// import type { PollinationData } from "$lib/types";

// export const load: PageServerLoad = async ({
//   locals,
//   params,
//   url
// }): Promise<PollinationData> => {
//   const userId = locals.user?.id;

//   if (userId) {
//     const thisUser = await db.query.users.findFirst({
//       where: eq(users.id, userId),
//       with: { mySeedbank: true }
//     });
//     let otherUserId = null;
//     const otherUserUsername = url.searchParams.get("authorBottom");
//     if (otherUserUsername) {
//       const otherUser = await db.query.users.findFirst({
//         where: eq(users.username, otherUserUsername)
//       });
//       if (otherUser) {
//         otherUserId = otherUser.id;
//       }
//     }
//     const plantId = params.parent1id;
//     if (thisUser && plantId) {
//       return {
//         thisUser
//       };
//     } else {
//       throw Error("could not find user when querying");
//     }
//   } else {
//     throw Error("userId missing");
//   }
// };
