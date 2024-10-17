<script lang="ts">
  import NewUserFirstPlant from "./NewUserFirstPlant.svelte";
  import PollinationResult from "./PollinationResult.svelte";
  import BRollZoomOut from "./BRollZoomOut.svelte";

  import { onDestroy, onMount } from "svelte";
  import type { DisplayNotifyServer } from "../../../api/displayNotifyServer/types";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import StatsGrowingTime from "./StatsGrowingTime.svelte";
  import BRollPan from "./BRollPan.svelte";
  import BRollDetail from "./BRollDetail.svelte";

  import { DisplayEventNames, type DisplayEvent } from "$lib/events.types";
  import BRollDetailMulti from "./BRollDetailMulti.svelte";
  import StatsPollinations from "./StatsPollinations.svelte";

  import { fade } from "svelte/transition";

  import { FADE_DURATION, IDLE_TIMEOUT } from "$lib/constants";
  import PollinationStarting from "./PollinationStarting.svelte";
  import type { RefreshDisplays } from "../../../api/displays/types";
  import Idle from "../../shared-components/Idle.svelte";

  export let data;

  let agent: TetherAgent | null = null;

  let nextTimeout = Date.now();
  let intervalCheck: NodeJS.Timeout | null = null;

  const notifyServer = async (message: DisplayNotifyServer) => {
    console.log("Notify server that", data.id, "has timed out...");
    const res = await fetch("/api/displayNotifyServer", {
      method: "POST",
      body: JSON.stringify(message)
    });
    console.log(
      "...",
      Date.now(),
      "updated server with timeout notice",
      res.status
    );
  };

  onMount(async () => {
    notifyServer({
      event: "init",
      displayId: data.id
    });
    if (intervalCheck) {
      clearInterval(intervalCheck);
    }
    nextTimeout = Date.now() + IDLE_TIMEOUT;
    console.log("onMount set nextTimeout", nextTimeout);

    console.log("start interval timer");
    intervalCheck = setInterval(() => {
      if (Date.now() >= nextTimeout) {
        console.log("... Timeout", nextTimeout, "reached!");
        notifyServer({
          displayId: data.id,
          event: "timeout"
        });
      }
    }, 1000);

    // Subscribe to instructions channel
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION,
      id: data.id
    });
    const instructionsPlug = await InputPlug.create(
      agent,
      "serverInstructDisplays",
      { id: data.id }
    );
    instructionsPlug.on("message", (p) => {
      const m = decode(p) as DisplayEvent;
      console.log(Date.now(), "ReceivedserverInstructDisplays message:", m);
      const { timeout } = m;
      data.event = m;

      if (timeout) {
        nextTimeout = Date.now() + timeout;
        console.log("update nextTimeout to", nextTimeout);
      }
    });

    const refreshPlug = await InputPlug.create(agent, "refresh");
    refreshPlug.on("message", (payload) => {
      const m = decode(payload) as RefreshDisplays;
      if (m.action === "reload") {
        console.info("Server requested reload...");
        location.reload();
      }
    });
  });

  onDestroy(async () => {
    if (intervalCheck) {
      clearInterval(intervalCheck);
    }
    agent?.disconnect();
  });
</script>

<!-- <code>
    {JSON.stringify(data.event)}
  </code> -->
<main class="w-full h-full presentation-gradient">
  {#if data.event}
    {#if data.event.name === DisplayEventNames.IDLE}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <Idle />
        {/key}
      </div>
    {/if}
    {#if data.event.name == DisplayEventNames.ANNOUNCE_FIRST_PLANT}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <NewUserFirstPlant
            plant={data.event.payload.plant}
            gardenerName={data.event.payload.user.username}
          ></NewUserFirstPlant>
        {/key}
      </div>
    {/if}

    {#if data.event.name === DisplayEventNames.ANNOUNCE_POLLINATION_STARTING}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <PollinationStarting
            authorTop={data.event.payload.authorTop}
            authorBottom={data.event.payload.authorBottom}
            plantTop={data.event.payload.plantTop}
            plantBottom={data.event.payload.plantBottom}
          />
        {/key}
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.ANNOUNCE_NEW_SPROUT}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <PollinationResult
            authorTop={data.event.payload.authorTop}
            authorBottom={data.event.payload.authorBottom}
            newPlant={data.event.payload.newPlant}
          ></PollinationResult>
        {/key}
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.DETAIL}
      <div class="w-full h-full" transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload.plant.id}
          <BRollDetail
            plant={data.event.payload.plant}
            user={data.event.payload.user}
          ></BRollDetail>
        {/key}
      </div>
    {/if}

    {#if data.event.name === DisplayEventNames.DETAIL_MULTI}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload.plantImages}
          <BRollDetailMulti plantImages={data.event.payload.plantImages} />
        {/key}
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.ZOOM_OUT}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <BRollZoomOut
            garden={data.event.payload.garden}
            userName={data.event.payload.user.username}
          ></BRollZoomOut>
        {/key}
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.ROLL_PAN}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <BRollPan gardens={data.event.payload}></BRollPan>
        {/key}
      </div>
    {/if}

    {#if data.event.name == DisplayEventNames.STATS_TIME}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <StatsGrowingTime
            imageUrl={data.event.payload.plant.imageUrl || ""}
            plantName={data.event.payload.plant.commonName}
            gardenerName={data.event.payload.user.username}
            created={data.event.payload.pollinationTimestamp}
          ></StatsGrowingTime>
        {/key}
      </div>
    {/if}

    {#if data.event?.name == DisplayEventNames.STATS_POLLINATIONS}
      <div transition:fade={{ duration: FADE_DURATION }}>
        {#key data.event.payload}
          <StatsPollinations
            plant={data.event.payload.plant}
            pollinationCount={data.event.payload.pollinationCount}
            user={data.event.payload.user}
          ></StatsPollinations>
        {/key}
      </div>
    {/if}
  {:else}
    <Idle />
  {/if}
</main>
