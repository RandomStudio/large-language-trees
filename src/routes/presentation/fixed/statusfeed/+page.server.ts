import { db } from "$lib/server/db";
import { eventLogs } from "$lib/server/schema";
import { desc, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { LIMIT_STATUS_FEED } from "$lib/constants";

type Log = {
  content: string;
  rowIndex: number;
}

export const load: PageServerLoad = async ({ }) => {
  const latestEvents = await db
    .select({
      contents: eventLogs.contents,
      rowIndex: sql<number>`ROW_NUMBER() OVER (ORDER BY ${eventLogs.timestamp} DESC)`,
    })
    .from(eventLogs)
    .orderBy(desc(eventLogs.timestamp))
    .limit(LIMIT_STATUS_FEED);

  let logs: Log[] = latestEvents.map((e) => {
    return {
      content: e.contents,
      rowIndex: e.rowIndex,
    } as Log;
  });

  // This is a bit of a hack, but allows us to nudge the rows up and hide the messy overlapping entrance transition off the top of the screen
  logs = [
    {
      content: "",
      rowIndex: 999999999,
    },
    ...logs,
  ]

  return { logs };
};
