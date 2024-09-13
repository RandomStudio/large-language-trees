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

<img src="FlowerDuo.png" class="absolute -z-10 opacity-100" alt="FlowerDuo" />
<div class="mx-10 pt-[15vh] font-primer text-6xl text-roel_blue">
  <p class="font-gyst text-center">LET'S<br />POLLINATE</p>
  <div class="text-center">
    <form
      method="post"
      use:enhance
      class="mt-4 text-center max-w-md"
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
          class="text-roel_blue bg-roel_green bg-opacity-75 rounded-full mt-2 text-center text-2xl"
        >
          Error: {form.message}
        </div>
        {#if form?.existingUser}
          <div
            class="text-roel_blue bg-roel_green bg-opacity-75 rounded-full mt-2 text-sm text-center"
          >
            Choose a different username, or <button
              data-umami-event="Login Anyway"
              data-test="login-anyway"
              class="underline"
              formaction="?/loginExistingUser">log in</button
            >
            as <span class="font-bold">{form.existingUser.username}</span> instead
          </div>
        {/if}
      {/if}
    </form>
  </div>
</div>
<div
  class="font-primer text-left mt-32 text-base mx-0 text-roel_green bg-roel_blue"
>
  <div class="p-10">
    <p>
      Welcome to Random's synergistic Lusthof, where digital abundance is
      sprouting.
      <br />
      <br /> Find other Gardeners in the studio to start cross-pollinating and witness
      your sprouts flourish in our communal garden.
    </p>
    <br />
    <div>
      <span class="font-bold">Production:</span><br />
      <span>Studio Random</span><br />
      <span class="font-bold">Image Data:</span><br />
      <span>Chat GPT/ Open AI</span>
    </div>
  </div>
</div>
<div class="w-screen h-60 bg-roel_blue -mt-[120px] fixed -z-10"></div>
