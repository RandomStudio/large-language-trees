<img
  src="/spinnerPlant.png"
  alt="Spinner"
  class="w-40 relative slow-reverse-spin"
  style="margin: auto;"
/>

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .slow-reverse-spin {
    animation: spin 4s linear infinite reverse; /* 4 seconds for slower spin and reverse direction */
  }
</style>
