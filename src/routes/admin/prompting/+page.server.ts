import { db } from "$lib/server/db";
import type { Actions, PageServerLoad } from "./$types";
import type {
  ImageModelNames,
  PromptConfig,
  TextModelNames
} from "../../../defaults/prompt-config";
import DefaultPrompt from "../../../defaults/prompt-config";
import { promptSettingsTable } from "$lib/server/schema";

export const load: PageServerLoad = async (): Promise<PromptConfig> => {
  console.log("loading page");
  const defaults = DefaultPrompt;
  const loadedFromDb = await db.query.promptSettingsTable.findFirst();
  if (loadedFromDb) {
    const details: PromptConfig = {
      text: {
        model: loadedFromDb.textModel as TextModelNames,
        preamble: {
          label: defaults.text.preamble.label,
          description: defaults.text.preamble.description,
          text: loadedFromDb.textPreamble
        },
        explanation: {
          label: defaults.text.explanation.label,
          description: defaults.text.explanation.description,
          text: loadedFromDb.textExplanation
        },
        instructions: {
          label: defaults.text.instructions.label,
          description: defaults.text.instructions.description,
          text: loadedFromDb.textInstructions
        }
      },
      image: {
        model: loadedFromDb.imageModel as ImageModelNames,
        instructions: loadedFromDb.imageInstructions
      }
    };
    return {
      ...details
    };
  } else {
    throw Error("Failed to load settings from DB");
  }
};

export const actions = {
  default: async (event) => {
    console.log("Save the new prompt settings!", event.request);
    const formData = await event.request.formData();
    const textModel = formData.get("textModel") as string;
    const textPreamble = formData.get("textPreamble") as string;
    const textExplanation = formData.get("textExplanation") as string;
    const textInstructions = formData.get("textInstructions") as string;
    if (textModel && textPreamble && textExplanation && textInstructions) {
      await db.update(promptSettingsTable).set({
        textModel,
        textPreamble,
        textExplanation,
        textInstructions
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