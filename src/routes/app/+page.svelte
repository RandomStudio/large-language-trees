<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  import { LIMIT_CHARACTERS_USERNAME } from "$lib/constants";
  import Layout from "./components/Layout.svelte";

  export let form: ActionData;

  let showButton = false;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    showButton = input.value.length > 0;
  }

  let formEl: HTMLFormElement;
  let isSubmitting = false;

  const handleSubmit = async (event: Event) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    isSubmitting = true;
  };

  $: if (form?.message) {
    isSubmitting = false;
  }
</script>

<Layout isFullPage>
  <div class="grid grid-rows-[auto_max-content] h-full font-primer">
    <div class="relative">
      <img
        src="FlowerDuo.png"
        class="absolute inset-0 -z-1 opacity-75 h-[110%] w-full object-cover"
        alt="FlowerDuo"
      />
      <div
        class="mx-10 pt-[15vh] text-6xl text-roel_blue z-2 h-full grid grid-rows-[max-content_1fr_max-content_2fr] justify-center"
      >
        <p class="row-start-1 font-gyst text-center">
          LET'S<br />POLLINATE
        </p>
        <div />
        <div
          class="text-center relative flex flex-col h-full justify-content-center align-items-center"
        >
          <form
            method="post"
            use:enhance
            class="mt-0 text-center max-w-md"
            bind:this={formEl}
            on:submit={handleSubmit}
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
              class="text-roel_green bg-roel_blue font-primer text-3xl px-4 py-[0.5rem] mt-4 w-full max-w-xs border-[3px] border-roel_blue rounded-full active:bg-roel_blue active:text-roel_green {isSubmitting &&
                'opacity-50'} select-none"
              type="submit"
              disabled={isSubmitting}
            >
              Start
            </button>
          </form>
        </div>
        <div />
      </div>
    </div>
    <div
      class=" text-left text-base mx-0 mb-0 text-roel_green bg-roel_blue textContainer"
    >
      {#if form?.message}
        <div class="p-10 credits font-normal">
          <p class="mb-4">
            Error: {form.message}
          </p>
          {#if form?.existingUser}
            <form method="POST" action="?/loginExistingUser">
              <input
                type="hidden"
                name="username"
                value={form.existingUser.username}
              />
              <input type="hidden" name="password" value={"123456"} />
              <p>
                Choose a different username, or <button
                  data-umami-event="Login Anyway"
                  data-test="login-anyway"
                  class="underline">log in</button
                >
                as <span class="font-bold">{form.existingUser.username}</span> instead
              </p>
            </form>
          {/if}
        </div>
      {:else}
        <div class="p-10 credits font-normal">
          <p class="mb-4">
            Welcome to Random's “Let's Pollinate”, the exclusive greenhouse,
            sprouting digital abundance.
          </p>
          <p>
            Find other Gardeners around you to start cross-pollinating and
            witness your sprouts flourish in our common garden.
          </p>
        </div>
      {/if}
    </div>
  </div>
</Layout>
