<script lang="ts">
  export let position: "top" | "bottom" = "bottom";
  export let background: "purple" | "green" = "purple";
</script>

<div
  class={`z-50 fixed text-center text-medium font-primer w-screen py-2` +
    " " +
    (position === "top" ? "top-0" : "bottom-0") +
    " " +
    (background === "purple"
      ? "text-roel_green bg-new_purple"
      : "text-new_purple bg-roel_green")}
>
  pollinate.garden
</div>
