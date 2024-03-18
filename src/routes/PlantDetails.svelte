<script lang="ts">
    import type { Plant } from "./types";

    export let props: Plant;
</script>

<div class="plant">
    <h2>
        {props.commonName}
    </h2>
    <div class="subtitle">
        {props.id}
    </div>
    <!-- <code>{JSON.stringify(props)}</code> -->
    <ul>
        {#each Object.entries(props.characteristics) as [key, value]}
            <li>{key}: {value}</li>
            <!-- <li>{item}</li> -->
        {/each}
    </ul>
    <p>{props.description}</p>
</div>

<style>
    .subtitle {
        font-style: italic;
        font-size: 1em;
    }
    li {
        margin: 0;
        list-style-type: none;
    }
</style>
