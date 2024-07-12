import { db } from "$lib/server/db";
import type { Actions, PageServerLoad } from "./$types";
import type { PromptConfig } from "../../../defaults/prompt-config";
import { promptSettingsTable } from "$lib/server/schema";
import { promptRowToConfig } from "$lib/promptUtils";

export const load: PageServerLoad = async (): Promise<PromptConfig> => {
  console.log("loading page");
  const loadedFromDb = await db.query.promptSettingsTable.findFirst();
  if (loadedFromDb) {
    return promptRowToConfig(loadedFromDb);
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
