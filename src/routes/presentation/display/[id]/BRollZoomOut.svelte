<script lang="ts">
  export let userName: string;
</script>

<body class="bg-roel_purple min-h-screen">
  <div
    class="bg-roel_rose w-full h-[250px] flex text-center text-roel_purple items-center justify-center text-6xl font-jeanb"
  >
    {userName}'s <br /> GARDEN
  </div>

  <div class="fixed bottom-5 left-40 text-roel_rose text-4xl font-primer">
    Join the Garden!
  </div>
  <div class="fixed left-5 bottom-5 w-28 h-auto">
    <img
      src="/livinggarden_QR_purple_green.png"
      alt="Barcode"
      class="w-full h-auto"
    />
  </div>
</body>
