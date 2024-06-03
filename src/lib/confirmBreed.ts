import { buildPrompt } from "./promptUtils";
import type { InsertPlant, SelectPlant } from "./types";
import DefaultPromptConfig from "../defaults/prompt-config";

export async function confirmBreed(
    parents: [SelectPlant, SelectPlant],
): Promise<InsertPlant> {
    console.log("confirmBreed...");
    const res = await fetch("/api/generate/plant", {
        method: "POST",
        body: JSON.stringify({
            prompt: buildPrompt(DefaultPromptConfig, parents[0], parents[1]),
            parents,
        }),
    });
    if (res.status === 200) {
        console.log("Created new candidate plant OK:", res);
        return (await res.json()) as InsertPlant;
    } else {
        const { status, statusText } = res;
        console.error("Error generating on backend:", { status, statusText });
        throw Error("Generate failure");
    }
}