<script lang="ts">
  import NewUserFirstPlant from "./NewUserFirstPlant.svelte";
  import PollinationResult from "./PollinationResult.svelte";

  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { DisplayNotifyServer } from "../../../api/displayNotifyServer/types";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import type { DisplayUpdateMessage } from "$lib/events.types";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";
  import StatsGrowingTime from "./StatsGrowingTime.svelte";
  import BRollStatusFeed from "./BRollStatusFeed.svelte";
  import BRollLeaderboard from "./BRollLeaderboard.svelte";
  import StatsCount from "./StatsCount.svelte";
  import PlantZoom from "./BRollDetail.svelte";

  import { bRollNaming } from "$lib/events.types";

  export let data: PageData;

  let agent: TetherAgent | null = null;

  let timer: NodeJS.Timeout | null = null;

  onMount(async () => {
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
      console.log("ReceivedserverInstructDisplays message:", m);
      const { payload, timeout } = m;
      if (timeout) {
        if (timer) {
          console.log("clear active timer");
          clearTimeout(timer);
          timer = null;
        }
        console.log("Set new timeout", timeout, "ms...");
        timer = setTimeout(() => {
          console.log("...Display Timeout reached!");
          const message: DisplayNotifyServer = {
            displayId: data.id,
            event: "timeout"
          };
          fetch("/api/displayNotifyServer", {
            method: "POST",
            body: JSON.stringify(message)
          }).then(() => {
            timer = null;
          });
        }, timeout);
      }
      data.contents = payload;
    });

    // Notify server that this display is online / reloaded
    const message: DisplayNotifyServer = {
      displayId: data.id,
      event: "init"
    };
    const res = await fetch("/api/displayNotifyServer", {
      method: "POST",
      body: JSON.stringify(message)
    });
    if (res.status !== 200) {
      console.error("Error notifying server", res.status, res.statusText);
    }
  });

  onDestroy(async () => {
    agent?.disconnect();
  });
</script>

<main>
  <h1>
    Display #{data.id}
  </h1>
  <div>
    <pre>
      <code>
        {JSON.stringify(data.contents, null, 2)}
      </code>
    </pre>
  </div>

  {#if data.contents}
    {#if data.contents.name == "newUserFirstPlant"}
      <NewUserFirstPlant
        imageUrl={data.contents.contents.plant.imageUrl || "/59.png"}
        plantName={data.contents?.contents.plant.commonName}
        gardenerName={data.contents?.contents.user.username}
      ></NewUserFirstPlant>
    {/if}

    {#if data.contents.name == "newPlantPollination"}
      <PollinationResult
        imageUrl={data.contents.contents.newPlant.imageUrl || "/59.png"}
        plantName={data.contents?.contents.newPlant.commonName}
      ></PollinationResult>
    {/if}

    {#if data.contents.name == bRollNaming.STATUS_FEED}
      <BRollStatusFeed contents={data.contents.contents}></BRollStatusFeed>
    {/if}

    {#if data.contents.name == bRollNaming.DETAIL}
      <PlantZoom></PlantZoom>
    {/if}

    {#if data.contents.name == bRollNaming.ZOOM_OUT}{/if}

    {#if data.contents.name == bRollNaming.ROLL_PAN}{/if}

    {#if data.contents.name == bRollNaming.TOP_LIST}
      <BRollLeaderboard contents={data.contents.contents}></BRollLeaderboard>
    {/if}

    {#if data.contents.name == bRollNaming.STATISTICS_1}
      <StatsGrowingTime
        imageUrl={data.contents.contents.plant.imageUrl || ""}
        plantName={data.contents.contents.plant.commonName}
        gardenerName={data.contents.contents.user.username}
        date={data.contents.contents.plant.created}
      ></StatsGrowingTime>
    {/if}

    {#if data.contents?.name == bRollNaming.STATISTICS_2}
      <StatsCount count={data.contents?.contents.count}></StatsCount>
    {/if}
  {/if}
</main>
