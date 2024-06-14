import { lucia } from "$lib/server/auth";
import { redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(lucia.sessionCookieName);
  if (!sessionId) {
    console.log("clear session info");
    event.locals.user = null;
    event.locals.session = null;
    console.log("path", event.url.pathname);
    if (event.url.pathname != "/") {
      // Every path other than root should redirect if user not logged in
      redirect(302, "/");
    } else {
      return resolve(event);
    }
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    console.log("set fresh session info");
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
  }
  if (!session) {
    console.log("create blank session cookie");
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
  }
  event.locals.user = user;
  event.locals.session = session;
  return resolve(event);
};
