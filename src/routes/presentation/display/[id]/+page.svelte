<script lang="ts">
  import NewUserFirstPlant from "./NewUserFirstPlant.svelte";
  import PollinationResult from "./PollinationResult.svelte";
  import PollinationEvent from "./PollinationEvent.svelte";

  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { DisplayNotifyServer } from "../../../api/displayNotifyServer/types";
  import {
    BROKER_DEFAULTS,
    decode,
    InputPlug,
    TetherAgent
  } from "tether-agent";
  import type { DisplayUpdateMessage } from "$lib/events.types";

  export let data: PageData;

  let agent: TetherAgent | null = null;

  let timer: NodeJS.Timeout | null = null;

  onMount(async () => {
    // Subscribe to instructions channel
    agent = await TetherAgent.create("presentation", {
      brokerOptions: {
        ...BROKER_DEFAULTS.browser,
        host: "50e2193c64234fd18838db7ad6711592.s1.eu.hivemq.cloud",
        port: 8884,
        protocol: "wss",
        path: "/mqtt"
      },
      id: data.id
    });
    const instructionsPlug = await InputPlug.create(
      agent,
      "serverInstructDisplays",
      { id: data.id }
    );
    instructionsPlug.on("message", (payload) => {
      const m = decode(payload) as DisplayUpdateMessage;
      console.log("ReceivedserverInstructDisplays message:", m);
      const { contents, timeout } = m;
      if (timeout) {
        timer = setTimeout(async () => {
          console.log("Display Timeout reached!");
          const message: DisplayNotifyServer = {
            displayId: data.id,
            event: "timeout"
          };
          await fetch("/api/displayNotifyServer", {
            method: "POST",
            body: JSON.stringify(message)
          });
          if (timer) {
            clearTimeout(timer);
          }
        }, timeout);
      }
      data.contents = contents;
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
    Display #{JSON.stringify(data.contents?.name)}
    {console.log("Name of the event" + JSON.stringify(data))}
  </h1>

  {#if data.contents?.name == "newUserFirstPlant"}
    <NewUserFirstPlant
      imageUrl={data.contents?.payload?.imageUrl}
      plantName={data.contents?.payload?.commonName}
      gardenerName="PlaceHolder"
    ></NewUserFirstPlant>
  {/if}

  {#if data.contents?.name == "newPlantPollination"}
    <PollinationResult
      imageUrl={data.contents?.payload?.imageUrl}
      plantName={data.contents?.payload?.commonName}
      gardenerName="PlaceHolder"
    ></PollinationResult>
  {/if}
</main>
