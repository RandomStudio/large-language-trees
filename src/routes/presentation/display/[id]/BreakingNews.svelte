<script lang="ts">
  export let imageUrl: string;
</script>

<body class="bg-roel_rose">
  <div
    class="w-full h-[250px] flex text-center items-center justify-center text-roel_rose text-6xl font-jeanb bg-roel_purple"
  >
    ROELSCOOTER'S <br /> LAVENDER
  </div>

  <div class="fill-roel_purple absolute top-1/2 w-full h-auto">
    <svg viewBox="0 0 1000 801" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 0H1000V301C1000 577.142 776.142 801 500 801C223.858 801 0 577.142 0 301V0Z"
      />
    </svg>
  </div>

  <div class="fixed inset-0 flex items-center justify-center">
    <img src={imageUrl} alt="Lavender" />
  </div>

  <div
    class="w-full h-[250px] flex text-center items-center justify-center absolute bottom-0 text-roel_purple text-6xl font-jeanb bg-roel_rose"
  >
    JUST SPROUTED <br /> IN THE GARDEN!
  </div>
</body>
