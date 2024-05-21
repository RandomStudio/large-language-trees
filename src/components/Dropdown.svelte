<script lang="ts">
    import { type InsertPlant, type SelectPlant } from "../lib/types"; // Assuming type import is correct
    import PlantCell from "./PlantCell.svelte";
    export let data: { seeds: SelectPlant[] };
</script>

<div class="dropdown">
    <div class="dropdown-content">
        {#each data.seeds as flower (flower.id)}
            <div class="draggable">
                {#if flower.imageUrl}
                    <img
                        src={flower.imageUrl}
                        alt="the real plant"
                        class="thumbnail"
                    />
                {:else}
                    <img
                        src="/plants/placeholder.png"
                        alt="placeholder"
                        class="thumbnail"
                    />
                {/if}
                <div class="plant-name">
                    {flower.commonName}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .dropdown {
        position: fixed; /* Anchors the menu to a position on the page */
        top: 0; /* Starts from the top of the viewport */
        right: 0; /* Aligns to the right side of the viewport */
        width: 200px; /* Width of the menu */
        height: 100vh; /* Full viewport height */
        background-color: #f9f9f9;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 1000; /* Ensures the menu remains above other elements */
        overflow-x: hidden; /* Hides horizontal scrollbar */
        overflow-y: auto; /* Allows vertical scrolling if content exceeds viewport height */
    }
    .dropdown-content {
        padding: 20px;
    }

    .draggable {
        width: 100%;
        position: relative;
        overflow: visible;
    }

    .thumbnail {
        position: relative;
        width: 100%; /* Agrandir l'image à 120% de sa cellule */
        left: 50%; /* Centrer horizontalement */
        transform: translate(
            -50%
        ); /* Ajustement pour le centrage vertical et horizontal */
        height: auto; /* Garder le ratio de l'image */
        top: 50%; /* Centrer verticalement */
    }

    .plant-name {
        position: relative;
        left: 50%; /* Centré horizontalement */
        font-size: 1em;
        white-space: nowrap; /* Empêche le texte de passer à la ligne */
        overflow: visible; /* Permet au texte de dépasser du conteneur */
        transform: translateX(-50%);
    }
</style>
