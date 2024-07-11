<script lang="ts">
  import type { PromptSection } from "../defaults/prompt-config";

  export let sectionData: PromptSection;
  export let name: string;
  export let onChange: () => void;

  let showInfo = false;
</script>

<label>
  <button on:click={() => (showInfo = !showInfo)}> ℹ️ </button>
  {sectionData.label}
  <div
    class={(showInfo ? "visible" : "invisible") +
      " absolute bg-slate-100 p-4 w-2/3 border-2 border-slate-500 shadow-xl text-sm"}
  >
    {sectionData.description}
  </div>
  <textarea
    class="w-full"
    rows={10}
    {name}
    bind:value={sectionData.text}
    on:input={onChange}
  />
</label>
