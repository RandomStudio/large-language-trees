<script lang="ts">
  import "../app/app.css";
  import { fade, fly, slide, blur } from "svelte/transition";
  import { quintOut, expoInOut } from "svelte/easing";

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
  <div
    transition:fly={{
      delay: 250,
      duration: 300,
      x: 100,
      easing: quintOut
    }}
  >
    {item}
  </div>
{/each}

<button
  class="rounded-lg border-double border-4 border-sky-500 p-2 m-2"
  on:click={() => (toggle = !toggle)}>Toggle</button
>

{#if toggle}
  <div
    in:fade={{ duration: 1000 }}
    out:blur={{ duration: 2000, axis: "x" }}
    class="h-20 border-2 border-solid border-slate-400 m-4 p-4"
  >
    <span transition:fade={{ duration: 50, easing: expoInOut }}>
      DYNAMIC TOGGLE
    </span>
  </div>
{/if}
