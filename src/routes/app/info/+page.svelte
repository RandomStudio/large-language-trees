<script lang="ts">
  import ReturnButton from "../../../components/ReturnButton.svelte";

  function goBack() {
    window.history.back();
  }
</script>

<ReturnButton onClicked={goBack}></ReturnButton>

<div class="mx-10 pt-20 font-primer text-left text-roel_blue text-base mb-20">
  <img src="/titleimg_new.png" alt="logo" />
  <p class="mt-12">
    What is this project about?
    <br />
    <br /> The "Let's Pollinate" app seeks to invert the typical narrative of
    digital technology as a force of isolation and detachment. Instead of
    pulling us deeper into the virtual world, Lusthof leverages technology to
    foster real-world connections and appreciation for the natural world. This
    approach envisions technology not as an isolating force, but as a catalyst
    for tangible, meaningful interactions.
    <br /><br />In The Garden, each user begins with a single seed, representing
    the potential for growth and connection. To enrich the communal garden and
    diversify their seed collection, users must engage with other gardeners. The
    combination of the Large Language Model (LLM) Chat-GPT and the text-to-image
    model DALL-E synthesises the characteristics of two plants to create a new,
    unique seedling.
    <br /><br />
    Initially, the app reflects classical garden aesthetics, where individual spaces
    are distinctly separated. These early stages of the garden echo historical views
    of gardens as paradises—exclusive, controlled environments that showcase human
    mastery over nature. However, as more plants are added, the garden evolves into
    a more chaotic, uncontrolled space. This transformation prompts critical reflection
    on the extent of control we exert through technology and within the garden itself.
    It challenges us to reconsider whether such control is desirable or necessary.
    <br /><br />Blending Digital and Natural Worlds <br /><br />The evolution
    from order to chaos mirrors broader questions about technology's role. By
    blending digital innovation with real-world interactions, Lusthof invites
    users to consider the balance between technological control and the vitality
    of the natural world.
  </p>
</div>
