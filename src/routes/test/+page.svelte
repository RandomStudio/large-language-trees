<script lang="ts">
  import "../app/app.css";
  import { fade } from "svelte/transition";

  let toggle = false;

  let aList = ["one", "two", "three", "four"];
</script>

<h1 class="font-semibold text-md">Animation Tests</h1>

<button
  class="rounded-lg border-double border-4 border-green-500 p-2 m-2"
  on:click={() => (aList = [...aList, (Math.random() * 100).toString()])}
  >➕ Add</button
>
<button
  class="rounded-lg border-double border-4 border-orange-500 p-2 m-2"
  on:click={() => (aList = aList.slice(0, -1))}>🗑️ Remove</button
>

<h2 class="font-semibold text-sm">The List</h2>
{#each aList as item}
  <div transition:fade={{ duration: 500 }}>{item}</div>
{/each}

<button
  class="rounded-lg border-double border-4 border-sky-500 p-2 m-2"
  on:click={() => (toggle = !toggle)}>Toggle</button
>

{#if toggle}
  <div
    in:fade={{ duration: 1000 }}
    out:fade={{ duration: 100 }}
    class="border-2 border-solid border-slate-400 m-4 p-4"
  >
    DYNAMIC TOGGLE
  </div>
{/if}
