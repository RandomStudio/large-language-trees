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

  export let data: PageData;

  let agent: TetherAgent | null = null;

  let nextTimeout = Date.now();
  let intervalCheck: NodeJS.Timeout | null = null;

  const notifyServer = async () => {
    const message: DisplayNotifyServer = {
      displayId: data.id,
      event: "timeout"
    };
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
    if (intervalCheck) {
      clearInterval(intervalCheck);
    }
    nextTimeout = Date.now() + 2000;
    console.log("onMount set nextTimeout", nextTimeout);

    console.log("start interval timer");
    intervalCheck = setInterval(() => {
      if (Date.now() >= nextTimeout) {
        console.log("... Timeout", nextTimeout, "reached!");
        notifyServer();
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

    {#if data.contents.name == "showStatusFeed"}
      <BRollStatusFeed contents={data.contents.contents}></BRollStatusFeed>
    {/if}

    {#if data.contents.name == "showLeaderboard"}
      <BRollLeaderboard contents={data.contents.contents}></BRollLeaderboard>
    {/if}

    {#if data.contents.name == "showPlantGrowingTime"}
      <StatsGrowingTime
        imageUrl={data.contents.contents.plant.imageUrl || ""}
        plantName={data.contents.contents.plant.commonName}
        gardenerName={data.contents.contents.user.username}
        date={data.contents.contents.plant.created}
      ></StatsGrowingTime>
    {/if}

    {#if data.contents?.name == "showPlantCount"}
      <StatsCount count={data.contents.contents.count}></StatsCount>
    {/if}
  {/if}
</main>
