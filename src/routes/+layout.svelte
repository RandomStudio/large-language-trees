<script>
    import "./garden/main.css";
</script>

<div class="app">
    <slot />
</div>

<style>
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

    .hover-bold:hover {
        font-weight: bold; /* Makes the font bold on hover */
    }

    .hover-bold {
        font-size: 15px;
        position: fixed;
        left: 10px;
        bottom: 10px;
        cursor: pointer; /* Changes the cursor to a pointer to indicate it's interactive */
        transition: font-weight 0.2s ease; /* Optional: adds a smooth transition for the font weight change */
        text-decoration: none; /* Optional: removes underline from the link, depending on your design needs */
        color: inherit; /* Optional: ensures the link color matches the surrounding text unless otherwise needed */
        z-index: 1000;
    }
</style>
