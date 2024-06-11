import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { plants, users } from "$lib/server/schema";
import { lucia } from "$lib/server/auth";
import {
    checkDefaultUsers,
    checkPlantsExist,
} from "$lib/server/server";

export const load: PageServerLoad = async ({ locals }) => {
    const username = locals.user?.username;
    const userId = locals.user?.id;
    if (!username) {
        console.log("Not logged in!");
        redirect(302, "/login");
    }

    if (userId) {
        await checkPlantsExist();
        await checkDefaultUsers();
        // const garden = await getUserGarden(userId);
        // const seeds = await getUserSeeds(userId);
        const allPlants = await db.select().from(plants);

        const thisUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });
        return { username, isAdmin: true, allPlants };
    } else {
        throw Error("userId missing");
    }
};

export const actions: Actions = {
    logout: async (event) => {
        if (!event.locals.session) {
            return fail(401);
        }
        await lucia.invalidateSession(event.locals.session.id);
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes,
        });
        redirect(302, "/");
    }
};
