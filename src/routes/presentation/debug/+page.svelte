<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { onDestroy, onMount } from "svelte";
  import { decode, InputPlug, TetherAgent } from "tether-agent";
  import { PLUG_NAMES } from "$lib/constants.js";
  import { DisplayEventNames } from "$lib/events.types.js";
  import { BROWSER_CONNECTION } from "../../../defaults/tether.js";

  const modes = Object.keys(DisplayEventNames).filter(
    (m) => !m.includes("ANNOUNCE")
  );
  let connected = false;
  let messages: string[] = [];

  let agent: TetherAgent | null = null;

  export let data;

  onMount(async () => {
    agent = await TetherAgent.create("presentation", {
      brokerOptions: BROWSER_CONNECTION
    });

    connected = agent.getIsConnected();

    const eventPlug = await InputPlug.create(agent, PLUG_NAMES.simpleEvents);

    eventPlug.on("message", (payload, topic) => {
      console.log("received message on", topic);
      const decoded = decode(payload);
      console.log(JSON.stringify(decoded));
      // messages.push(JSON.stringify(decoded));
      messages = [...messages, JSON.stringify(decoded, null, 2)];
      console.log(messages.length);
    });

    const displayInstructionsPlug = await InputPlug.create(
      agent,
      PLUG_NAMES.displayInstructions
    );

    displayInstructionsPlug.on("message", () => {
      invalidateAll();
    });
  });

  onDestroy(async () => {
    connected = false;
    agent?.disconnect();
  });
</script>

<main class="overflow-scroll w-screen h-screen p-10 bg-white">
  <h1>Presentation Views: Debug</h1>
  <div>
    Tether@{agent?.getConfig().brokerOptions.host}: {connected
      ? "✅ connected"
      : "❌ not connected"}
  </div>

  <div>
    Re-initialise dynamic displays:
    <button
      class="border-2 border-slate-100 p-2 rounded-md bg-orange-500 text-sm text-slate-50 shadow-md"
      on:click={async () => {
        await fetch("/api/displays", {
          method: "POST",
          body: JSON.stringify({
            action: "init"
          })
        });
        invalidateAll();
      }}
    >
      RESET
    </button>
    <button
      class="border-2 border-slate-100 p-2 rounded-md bg-green-500 text-sm text-slate-50 shadow-md"
      on:click={async () => {
        await fetch("/api/displays", {
          method: "POST",
          body: JSON.stringify({
            action: "reload"
          })
        });
      }}
    >
      RELOAD
    </button>
  </div>

  <div>
    <h2 class="font-bold text-xl">Test Displays</h2>
    {#each modes as m}
      <button
        class="rounded border-solid border-sky-500 border-2 p-2 m-2"
        on:click={async () => {
          await fetch(`/api/forceDisplay?mode=${m}`, {
            method: "POST"
          });
        }}>{m}</button
      >
    {/each}
  </div>

  <h2 class="font-bold text-xl">Presentation State</h2>
  <ul>
    {#each data.displays as display}
      <div class="border-solid border-2 border-slate-300 m-2 p-2">
        <h3 class="font-bold border-b-slate-200 border-b-2">
          Display "{display.id}":
          <a
            href={`/presentation/dynamic/${display.id}`}
            target="_blank"
            rel="noopener"
          >
            <span
              class="border-2 border-slate-100 p-2 rounded-md bg-slate-50 text-sm text-slate-500 shadow-md"
            >
              Open display in new tab
            </span>
          </a>
        </h3>
        <div class="h-60 overflow-scroll">
          Contents: <pre class="text-xs"><code
              >{display.contents === null
                ? "empty"
                : JSON.stringify(display.contents, null, 2)}</code
            ></pre>
        </div>
      </div>
    {/each}
  </ul>

  <h2 class="font-bold text-xl">Incoming Events</h2>
  <h3 class="font-bold">Received {messages.length} events</h3>
  <div>
    {#each messages as m}
      <div class="w-screen text-xs"><pre><code>{m}</code></pre></div>
    {/each}
  </div>
</main>
