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
    <p>{props.description}</p>
</div>
