<script lang="ts">
  import { onMount } from "svelte";

  export let src: string;

  let canvasElement: HTMLCanvasElement;

  onMount(() => {
    const img = new Image();
    img.src = src;
    const ctx = canvasElement.getContext("2d");
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
    };
  });
</script>

<div>
  <canvas bind:this={canvasElement} width="1024" height="1024" class="max-w" />
</div>
