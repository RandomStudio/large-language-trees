<script lang="ts">
  import ReturnButton from "../../../components/ReturnButton.svelte";

  function goBack() {
    window.history.back();
  }
</script>

<ReturnButton functionReturn={goBack}></ReturnButton>

<div class="mx-10 pt-20 font-primer text-left text-roel_blue mb-20">
  <p class="font-jeanb text-center text-6xl">LET'S<br />POLLINATE</p>
  <p class="mt-12 text-base">
    What is this project about?
    <br />
    <br /> The Let's Pollinate app seeks to invert the typical narrative of
    digital technology as a force of isolation and detachment. Instead of
    pulling us deeper into the virtual world, Let's Pollinate leverages
    technology to foster real-world connections and appreciation for the natural
    world. This approach envisions technology not as an isolating force, but as
    a catalyst for tangible, meaningful interactions.
    <br /><br />Each user begins with a single seed, representing the potential
    for growth and connection. To enrich the communal garden and diversify their
    seed collection, users must engage with other gardeners. The combination of
    the Large Language Model (LLM) Chat-GPT and the text-to-image model DALL-E
    synthesises the characteristics of two plants to create a new, unique
    seedling.
    <br /><br /> Through the act of creating something unique together and playful
    graphics, each connection becomes something special and is being celebrated in
    the community.
  </p>
</div>
