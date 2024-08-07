<script lang="ts">
  import NewUserFirstPlant from "./NewUserFirstPlant.svelte";
  import PollinationResult from "./PollinationResult.svelte";
  import BRollZoomOut from "./BRollZoomOut.svelte";

  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { DisplayNotifyServer } from "../../../api/displayNotifyServer/types";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import type { DisplayUpdateMessage } from "$lib/events.types";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import StatsGrowingTime from "./StatsGrowingTime.svelte";
  import BRollStatusFeed from "./BRollStatusFeed.svelte";
  import BRollLeaderboard from "./BRollLeaderboard.svelte";
  import BRollPan from "./BRollPan.svelte";
  import StatsCount from "./StatsCount.svelte";
  import BRollDetail from "./BRollDetail.svelte";

  import { bRollNaming } from "$lib/events.types";

  export let data: PageData;

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
    nextTimeout = Date.now() + 2000;
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
      const m = decode(p) as DisplayUpdateMessage;
      console.log(Date.now(), "ReceivedserverInstructDisplays message:", m);
      const { payload, timeout } = m;
      data.contents = payload;

      if (timeout) {
        nextTimeout = Date.now() + timeout;
        console.log("update nextTimeout to", nextTimeout);
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

<main>
  {#if data.contents}
    {#if data.contents.name == "newUserFirstPlant"}
      <NewUserFirstPlant
        imageUrl={data.contents.contents.plant.imageUrl || "/59.png"}
        plantName={data.contents.contents.plant.commonName}
        gardenerName={data.contents.contents.user.username}
      ></NewUserFirstPlant>
    {/if}

    {#if data.contents.name == "newPlantPollination"}
      <PollinationResult
        imageUrl={data.contents.contents.newPlant.imageUrl || "/59.png"}
        plantName={data.contents.contents.newPlant.commonName}
      ></PollinationResult>
    {/if}

    {#if data.contents.name == bRollNaming.STATUS_FEED}
      <BRollStatusFeed
        eventLogs={data.contents.contents.eventLogs}
        gardens={data.contents.contents.gardens}
      ></BRollStatusFeed>
    {/if}

    {#if data.contents.name == bRollNaming.DETAIL}
      <BRollDetail
        imageUrl={data.contents.contents.plant.imageUrl || ""}
        plantName={data.contents.contents.plant.commonName}
        userName={data.contents.contents.user.username}
      ></BRollDetail>
    {/if}

    {#if data.contents.name == bRollNaming.ZOOM_OUT}
      <BRollZoomOut
        garden={data.contents.contents.garden}
        userName={data.contents.contents.user.username}
      ></BRollZoomOut>
    {/if}

    {#if data.contents.name == bRollNaming.ROLL_PAN}
      <BRollPan gardens={data.contents}></BRollPan>
    {/if}

    {#if data.contents.name == bRollNaming.TOP_LIST}
      <BRollLeaderboard
        topPollinators={data.contents.contents.topPollinators}
        topGarden={data.contents.contents.topGarden}
      ></BRollLeaderboard>
    {/if}

    {#if data.contents.name == bRollNaming.STATISTICS_1}
      <StatsGrowingTime
        imageUrl={data.contents.contents.plant.imageUrl || ""}
        plantName={data.contents.contents.plant.commonName}
        gardenerName={data.contents.contents.user.username}
        created={data.contents.contents.plant.created}
      ></StatsGrowingTime>
    {/if}

    {#if data.contents?.name == bRollNaming.STATISTICS_2}
      <StatsCount
        count={data.contents.contents.count}
        gardens={data.contents.contents.gardens}
      ></StatsCount>
    {/if}
  {/if}
</main>
