import { db } from "$lib/server/db";
import { eventLogs } from "$lib/server/schema";
import { desc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { LIMIT_STATUS_FEED } from "$lib/constants";

type Log = {
  contents: string;
  messageIndex: number;
};

export const load: PageServerLoad = async () => {
  const latestEvents = await db
    .select()
    .from(eventLogs)
    .orderBy(desc(eventLogs.timestamp))
    .limit(LIMIT_STATUS_FEED);

  const logs: Log[] = latestEvents.map((e, i) => {
    return {
      contents: e.contents,
      messageIndex: latestEvents.length - i
    } as Log;
  });

  return { logs };
};
