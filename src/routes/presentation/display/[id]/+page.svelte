<script lang="ts">
  import NewUserFirstPlant from "./NewUserFirstPlant.svelte";
  import PollinationResult from "./PollinationResult.svelte";
  import PollinationEvent from "./PollinationEvent.svelte";

  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import type { DisplayNotifyServer } from "../../../api/displayNotifyServer/types";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import type { DisplayUpdateMessage } from "$lib/events.types";
  import { BROWSER_CONNECTION } from "../../../../defaults/tether";

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
    {JSON.stringify(data.contents?.name)}
    {console.log("Data of the event" + JSON.stringify(data))}
  </h1>

  {#if data.contents?.name == "newUserFirstPlant"}
    <NewUserFirstPlant
      imageUrl={data.contents.contents.plant.imageUrl || "/59.png"}
      plantName={data.contents?.contents.plant.commonName}
      gardenerName={data.contents?.contents.user.username}
    ></NewUserFirstPlant>
  {/if}

  {#if data.contents?.name == "newPlantPollination"}
    <PollinationResult
      imageUrl={data.contents.contents.plant.imageUrl || "/59.png"}
      plantName={data.contents?.contents.plant.commonName}
    ></PollinationResult>
  {/if}
</main>
