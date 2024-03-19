<div class="app">
    <slot />
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");

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
</style>
