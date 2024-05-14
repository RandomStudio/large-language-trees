<script lang="ts">
    import type { SelectPlant } from "../types";

    export let data: SelectPlant;
    //console.log(data);
</script>

<div class="cell">
    <div class="draggable">
        {#if data.imageUrl}
            <img src={data.imageUrl} alt="the real plant" class="thumbnail" />
        {:else}
            <img
                src="/plants/placeholder.png"
                alt="placeholder"
                class="thumbnail"
            />
        {/if}
        <div class="plant-name">
            {data.commonName}
        </div>
    </div>
</div>

<style>
    .draggable {
        position: relative;
        color: black;
        width: 64px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .plant-name {
        position: absolute;
        top: 50px;
        color: black;
        text-align: center;
    }

    img {
        width: 100%;
    }
</style>
