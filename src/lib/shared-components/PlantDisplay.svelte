<script lang="ts">
  import type { PublicUserInfo } from "$lib/types";
  import {
    Application,
    Assets,
    Point,
    Container,
    MeshRope,
    Graphics,
    Sprite,
    RenderTexture
  } from "pixi.js";
  import { onDestroy, onMount } from "svelte";

  export let imageUrl: string;
  export let label: string | null = null;
  export let authorTopUser: PublicUserInfo | null = null;
  export let authorBottomUser: PublicUserInfo | null = null;
  export let description: string | null = null;
  export let applyFilters: boolean = false;
  export let disableAnimation: boolean = false;
  /**
    Default width, can be overridden
  */
  export let imageClass: string = "";

  let canvasElement: HTMLCanvasElement;

  let app: Application | null = null;

  onMount(async () => {
    if (disableAnimation === true) {
      return;
    }

    // Create a new application with the specified canvas
    app = new Application();

    await app.init({
      view: canvasElement,
      width: 1024,
      height: 1024,
      backgroundAlpha: 0
    });

    console.log(app, canvasElement);

    // Load the snake texture
    const texture = await Assets.load(imageUrl);
    console.log("Texture loaded:", texture);

    const sprite = Sprite.from(texture);
    console.log("Sprite created:", sprite);

    sprite.anchor.set(0, 1); // required so rotation works from centre
    sprite.angle = 90;

    const container = new Container();
    container.addChild(sprite);

    const rt = RenderTexture.create({
      width: 1024,
      height: 1024
    });

    app.renderer.render({ container: container, target: rt });

    let count = 0;

    // Build a rope from points!
    const ropeLength = 918 / 15;
    const points: Point[] = [];

    for (let i = 0; i < 15; i++) {
      points.push(new Point(i * ropeLength, 0));
    }

    // Create the snake MeshRope
    const strip = new MeshRope({ texture: rt, points });

    const containerOutput = new Container();
    containerOutput.addChild(strip);

    const g = new Graphics();

    g.x = strip.x;
    g.y = strip.y;
    containerOutput.addChild(g);

    containerOutput.scale.x = 1.19;

    containerOutput.x = 1024 / 2;
    containerOutput.y = 1024;

    containerOutput.angle = -90;

    app.stage.addChild(containerOutput);

    // Animate the rope points
    app.ticker.add(() => {
      count += 0.02;

      // make the snake
      for (let i = 4; i < points.length; i++) {
        points[i].y = Math.sin(i * 0.5 + count) * 5;
        points[i].x = i * ropeLength + Math.cos(i * 0.3 + count) * 6;
      }
    });
    console.log("Canvas element:", canvasElement);
  });

  onDestroy(() => {
    if (app) {
      console.log("destroy PixiJS app");
      app.destroy();
    }
  });
</script>

<div>
  {#if disableAnimation}
    <img class={imageClass} src={imageUrl} alt="Static plant, no animation" />
  {:else}
    <canvas
      bind:this={canvasElement}
      width="1024"
      height="1024"
      class:filter={applyFilters}
      class:grayscale={applyFilters}
      class:opacity-65={applyFilters}
      class:contrast-200={applyFilters}
      class:mix-blend-difference={applyFilters}
    />
  {/if}
  {#if label}
    <div class="pt-2 text-center text-small capitalize">{label}</div>
  {/if}
  {#if authorTopUser && authorBottomUser}
    <p class="font-normal text-center text-small capitalize">
      {authorTopUser.username} ♡ {authorBottomUser.username}
    </p>
  {/if}

  {#if description}
    <div class="pt-1 text-center text-xs">{description}</div>
  {/if}
</div>
