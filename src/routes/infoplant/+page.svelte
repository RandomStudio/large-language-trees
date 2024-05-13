<script lang="ts">
    import { type InsertPlant, type SelectPlant } from "../../../types";
    export let data: { seeds: SelectPlant[] };
</script>

<div class="page">
    <h1>{data.seeds.length} Seeds</h1>
    <ul class="seeds-list">
        {#each data.seeds as plantdetails}
            <li>
                <img
                    src={plantdetails.imageUrl}
                    alt={`saved image of ${plantdetails.commonName}`}
                    width="100"
                />
            </li>
        {/each}
    </ul>
</div>
