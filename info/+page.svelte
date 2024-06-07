<script lang="ts">
    function goBack() {
        window.history.back();
    }
</script>

<div
    class="relative flex items-center justify-center min-h-screen bg-roel_green"
>
    <button
        class="fixed top-10 right-10 text-roel_blue text-2xl"
        on:click={goBack}
    >
        ✕
    </button>
    <main class="mx-14 w-full max-w-4xl">
        <div class="flex justify-center">
            <canvas id="canvas" style="display:none;"></canvas>
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img src="/titleimg.png" alt="logo" style="display:block;" />
        </div>

        <div class="text-left">
            <p class="text-roel_blue">
                Welcome to the common garden of Lucullus. This Digital Common
                Garden is about connection and cross-pollination.<br /><br />
                Find other Gardeners to start cross-breeding and witness the offspring
                flourish in the common garden of Lucullus.
            </p>
            <br />
            <div class="text-left">
                <span class="text-roel_blue font-semibold">Production:</span><br
                />
                <span class="text-roel_blue">Studio Random</span><br />
                <span class="text-roel_blue font-semibold">Image Data:</span><br
                />
                <span class="text-roel_blue">Chat GPT/ Open AI</span><br /><br
                />
            </div>
        </div>
    </main>
</div>
