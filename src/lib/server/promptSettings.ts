import { promptRowToConfig } from "$lib/promptUtils";
import type { PromptConfig } from "$lib/types";
import { db } from "./db";

/** Load prompt settings from the database, only substituting defaults
 * where absolutely necessary.
 */
export const getPromptSettings = async (): Promise<PromptConfig> => {
  const saved = await db.query.promptSettingsTable.findFirst();
  if (saved) {
    return promptRowToConfig(saved);
  } else {
    throw Error("Failed to load saved prompt settings from DB!");
  }
};
