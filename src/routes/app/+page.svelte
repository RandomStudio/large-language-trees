<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  import { LIMIT_CHARACTERS_USERNAME } from "$lib/constants";

  export let form: ActionData;

  let showButton = false;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    showButton = input.value.length > 0;
  }
</script>

<img
  src="FlowerDuo.png"
  class="absolute left-0 right-0 -z-1 opacity-75"
  alt="FlowerDuo"
/>
<div class="mx-10 pt-[15vh] font-primer text-6xl text-roel_blue z-2">
  <p class="font-gyst text-center mb-[60px]">LET'S<br />POLLINATE</p>
  <div class="text-center relative">
    <form
      method="post"
      use:enhance
      class="mt-0 text-center max-w-md"
      action="?/attemptNewRegistration"
    >
      <input
        class="bg-roel_green/75 border-[3px] border-roel_blue rounded-full text-roel_blue font-primer text-3xl px-4 py-[0.5rem] w-full max-w-xs placeholder-roel_blue placeholder:font-primer"
        type="text"
        id="username"
        name="username"
        data-test="username-field"
        placeholder="Fill in your name"
        maxlength={LIMIT_CHARACTERS_USERNAME}
        on:input={handleInput}
      />
      <input
        class="bg-roel_green text-roel_blue py-2 px-4 border border-roel_blue rounded-full placeholder-roel_blue focus:outline-none focus:border-roel_blue mt-2 hidden w-11/12 max-w-xs"
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        value="123456"
      />

      <button
        data-umami-event="Start button"
        data-test="start-button"
        class="text-roel_green bg-roel_blue font-primer text-3xl px-4 py-[0.5rem] mt-4 w-full max-w-xs border-[3px] border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green"
        type="submit"
      >
        Start
      </button>

      {#if form?.message}
        <div
          class="text-roel_blue bg-roel_green bg-opacity-75 text-center absolute top-100 left-0 right-0 text-small py-4"
        >
          <div>
            Error: {form.message}
          </div>
          {#if form?.existingUser}
            <div class="mt-2">
              Choose a different username, or <button
                data-umami-event="Login Anyway"
                data-test="login-anyway"
                class="underline"
                formaction="?/loginExistingUser">log in</button
              >
              as <span class="font-bold">{form.existingUser.username}</span> instead
            </div>
          {/if}
        </div>
      {/if}
    </form>
  </div>
</div>
<div
  class="font-primer text-left mt-32 text-base mx-0 text-roel_green bg-roel_blue"
>
  <div class="p-10 credits">
    <p>
      Welcome to Random's “Let's Pollinate”, the exclusive greenhouse, sprouting
      digital abundance.
    </p>
    <p>
      Find other Gardeners around you to start cross-pollinating and witness
      your sprouts flourish in our common garden.
    </p>
    <h3 class="font-bold">Production:</h3>
    <ul>
      <li>Random Studio</li>
      <li>Daan Lucas</li>
    </ul>
    <h3 class="font-bold">Concept:</h3>
    <ul>
      <li>Roel Wouters</li>
      <li>Zoë Breed</li>
    </ul>
    <h3 class="font-bold">Executive Production:</h3>
    <ul>
      <li>Rachel Short</li>
      <li>Debbie Schonenberg</li>
    </ul>
    <h3 class="font-bold">Development:</h3>
    <ul>
      <li>Stephen Buchanan</li>
      <li>Andrew Hill</li>
      <li>Jonathan Modin</li>
      <li>Jessie Kürschner</li>
      <li>Hector Albiges-Lambard</li>
    </ul>
    <h3 class="font-bold">Design:</h3>
    <ul>
      <li>Finann</li>
      <li>Roel</li>
    </ul>
    <h3 class="font-bold">Image Data:</h3>
    <ul>
      <li>Chat GPT/ Open AI</li>
    </ul>
  </div>
</div>

<style scoped>
  .credits :global(p) {
    margin-bottom: 1rem;
  }
  .credits :global(h3) {
    margin-top: 2rem;
  }
</style>
