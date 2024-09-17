<script lang="ts">
  import { goto } from "$app/navigation";
  import type { SelectPlant } from "$lib/types";
  import ReturnButton from "$lib/shared-components/ReturnButton.svelte";
  import Layout from "../components/Layout.svelte";

  export let closePopup: () => any;
</script>

<ReturnButton onClick={closePopup} />

<div
  class="fixed inset-0 p-10 bg-new_purple text-roel_green font-regular font-primer text-xs z-10 overflow-auto"
>
  <div class="w-full relative">
    <img
      src="/FlowerDuo.png"
      class="absolute left-[50%] -translate-x-2/4 -z-1 h-full opacity-50"
      alt="FlowerDuo"
    />
    <div class="py-[10vh] font-primer text-6xl text-roel_green z-2">
      <p class="font-gyst text-center">LET'S<br />POLLINATE</p>
    </div>
  </div>
  <p class="font-medium mb-4 mt-2">What is this project about?</p>
  <p class="mb-4">
    The "Let's Pollinate" app seeks to invert the typical narrative of digital
    technology as a force of isolation and detachment. Instead of pulling us
    deeper into the virtual world, Lusthof leverages technology to foster
    real-world connections and appreciation for the natural world. This approach
    envisions technology not as an isolating force, but as a catalyst for
    tangible, meaningful interactions.
  </p>
  <p class="mb-4">
    In The Garden, each user begins with a single seed, representing the
    potential for growth and connection. To enrich the communal garden and
    diversify their seed collection, users must engage with other gardeners. The
    combination of the Large Language Model (LLM) Chat-GPT and the text-to-image
    model DALL-E synthesises the characteristics of two plants to create a new,
    unique seedling.
  </p>
  <p class="mb-4">
    Initially, the app reflects classical garden aesthetics, where individual
    spaces are distinctly separated. These early stages of the garden echo
    historical views of gardens as paradises—exclusive, controlled environments
    that showcase human mastery over nature. However, as more plants are added,
    the garden evolves into a more chaotic, uncontrolled space. This
    transformation prompts critical reflection on the extent of control we exert
    through technology and within the garden itself. It challenges us to
    reconsider whether such control is desirable or necessary.
  </p>
  <p class="font-medium mb-4 mt-2">Blending Digital and Natural Worlds</p>
  <p class="mb-4">
    The evolution from order to chaos mirrors broader questions about
    technology's role. By blending digital innovation with real-world
    interactions, Lusthof invites users to consider the balance between
    technological control and the vitality of the natural world.
  </p>
</div>
