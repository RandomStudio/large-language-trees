import { db } from "$lib/server/db";
import { promptSettingsTable } from "$lib/server/schema";
import type { PageServerLoad } from "../$types";
import type {
  ImageModelNames,
  PromptConfig,
  TextModelNames
} from "../../../defaults/prompt-config";
import DefaultPrompt from "../../../defaults/prompt-config";

export const load: PageServerLoad = async (): Promise<PromptConfig> => {
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
