import { lucia } from "$lib/server/auth";
import { redirect, type Handle } from "@sveltejs/kit";

const publicAccessAllowed = (pathname: string) =>
  pathname.includes("/api/plants") ||
  pathname.includes("/api/plants") ||
  pathname.includes("/presentation/display") ||
  pathname.includes("/presentation/debug") ||
  pathname.includes("/api/events") ||
  pathname.includes("/api/forceDisplay") ||
  pathname.includes("/api/displayNotifyServer");

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname === "/") {
    redirect(302, "/app");
  }

  if (publicAccessAllowed(event.url.pathname)) {
    console.log("Unauthenticated access to", event.url.pathname, "allowed");
    return resolve(event);
  }

  const sessionId = event.cookies.get(lucia.sessionCookieName);
  if (!sessionId) {
    console.log("no session;clear session info");
    event.locals.user = null;
    event.locals.session = null;
    console.log("path", event.url.pathname);
    if (event.url.pathname != "/app") {
      // Every path other than root should redirect if user not logged in
      console.log("user not logged in; redirect");
      redirect(302, "/app");
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
