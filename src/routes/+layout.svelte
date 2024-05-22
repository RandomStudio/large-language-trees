<script>
    import "./garden/main.css";
</script>

<div class="app">
    <slot />
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");

    :global(.container) {
        display: flex;
        margin: 2em;
    }

    :global(body) {
        font-family: "Playfair Display", serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
    }

    :global(h1) {
        font-size: 3em;
        font-weight: 800;
    }

    :global(h2, h3, h4) {
        margin: 0;
    }

    :global(button) {
        cursor: pointer;
        font-family: "Playfair Display", serif;
        font-weight: 800;
        border: 0;
        padding: 1em;
    }
</style>
