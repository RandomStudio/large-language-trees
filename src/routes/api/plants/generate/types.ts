import type { SelectPlant } from "$lib/types";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export interface GeneratePlantRequestBody {
  userId: string;
  prompt?: ChatCompletionMessageParam[];
  model?: string;
  parents: [SelectPlant, SelectPlant];
}
