<script>
    export let plantDetails;
    export let closePopup;
</script>

{#if plantDetails}
    <div class="overlay">
        <div class="popup">
            <button on:click={closePopup}>Fermer</button>
            <p>{plantDetails.commonName}</p>
            <p>{plantDetails.description}</p>
            <p>{plantDetails.properties}</p>
        </div>
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Fond semi-transparent */
        display: flex;
        align-items: center; /* Centre verticalement */
        justify-content: center; /* Centre horizontalement */
        z-index: 10; /* Haute priorité pour rester sur le dessus */
    }

    .popup {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        width: auto;
        max-width: 80%; /* Adaptation à la taille de l'écran */
        text-align: center; /* Texte centré */
        z-index: 100; /* S'assure que le popup est au-dessus de l'overlay */
    }

    button {
        margin: 10px 0; /* Espacement autour du bouton */
        padding: 10px 20px; /* Taille du bouton */
        z-index: 999;
    }
</style>
