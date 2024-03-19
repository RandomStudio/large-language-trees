<script lang="ts">
    import type { Plant, PromptConfig } from "./types";
    import defaults from "./api/create/prompt-config.json";
    import { buildPrompt } from "./api/create/promptUtils";

    export let parents: [Plant, Plant];
    const [plant1, plant2] = parents;

    const config = defaults as PromptConfig;

    let finalPrompt = buildPrompt(config, plant1, plant2).content as string;
</script>

<div>
    <h3>Prompt Engineering</h3>
    <!-- <code>{JSON.stringify(Object.entries(config))}</code> -->
    <form>
        {#each Object.entries(config) as [key, value]}
            <label>
                {value.label}
                <textarea value={value.text} />
            </label>
        {/each}
    </form>

    <h4>Final text:</h4>
    <p class="small">{finalPrompt}</p>
</div>

<style>
    textarea {
        width: 100%;
        min-height: 6em;
    }
    .small {
        font-size: 1em;
        line-height: 1em;
    }
</style>
