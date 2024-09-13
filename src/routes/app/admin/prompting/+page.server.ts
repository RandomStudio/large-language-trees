import { db } from "$lib/server/db";
import { promptSettingsTable, users } from "$lib/server/schema";
import { promptRowToConfig } from "$lib/promptUtils";
import type { Actions, PageServerLoad } from "./$types";
import { stripUserInfo } from "$lib/security";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async () => {
  const adminUser = await db.query.users.findFirst({
    where: eq(users.username, "admin")
  });
  if (!adminUser) {
    throw Error("admin user not found");
  }
  const loadedFromDb = await db.query.promptSettingsTable.findFirst();
  if (loadedFromDb) {
    return {
      promptConfig: promptRowToConfig(loadedFromDb),
      adminUserDetails: stripUserInfo(adminUser)
    };
  } else {
    throw Error("Failed to load settings from DB");
  }
};

export const actions = {
  default: async (event) => {
    console.log("Save the new prompt settings!", event.request);
    const formData = await event.request.formData();
    const textModel = formData.get("textModel") as string | undefined;
    const textPreamble = formData.get("textPreamble") as string | undefined;
    const textExplanation = formData.get("textExplanation") as
      | string
      | undefined;
    const textInstructions = formData.get("textInstructions") as
      | string
      | undefined;
    const imageInstructions = formData.get("imageInstructions") as
      | string
      | undefined;
    const imageModel = formData.get("imageModel") as string | undefined;
    if (textModel && textPreamble && textExplanation && textInstructions) {
      console.log("Updating text-generation prompt settings...");
      await db.update(promptSettingsTable).set({
        textModel,
        textPreamble,
        textExplanation,
        textInstructions
      });
    } else if (imageInstructions && imageModel) {
      console.log("Updating image-generation prompt settings...");
      await db.update(promptSettingsTable).set({
        imageInstructions,
        imageModel
      });
    } else {
      throw Error(
        "Form data fields appear blank: " +
          JSON.stringify({
            textModel,
            textPreamble,
            textExplanation,
            textInstructions
          })
      );
    }
  }
} satisfies Actions;
