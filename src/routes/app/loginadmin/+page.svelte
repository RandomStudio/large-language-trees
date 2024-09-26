<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  export let form: ActionData;
  let isSubmitting = false;

  let showButton = false;

  let formEl: HTMLFormElement;

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    showButton = input.value.length > 0;
  }

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

<form method="post" use:enhance class="mt-0 text-center max-w-md">
  <input
    class="bg-roel_green/75 border-[3px] border-roel_blue rounded-full text-roel_blue font-primer text-3xl px-4 py-[0.5rem] w-full max-w-xs placeholder-roel_blue placeholder:font-primer"
    type="text"
    id="username"
    name="username"
    data-test="username-field"
    placeholder="username"
    on:input={handleInput}
  />
  <input
    class="bg-roel_green text-roel_blue py-2 px-4 border border-roel_blue rounded-full placeholder-roel_blue focus:outline-none focus:border-roel_blue mt-2 w-11/12 max-w-xs"
    type="password"
    id="password"
    name="password"
    placeholder="Password"
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

{#if form?.message}
  <div class="p-10 credits font-normal">
    <p class="mb-4">
      Error: {form.message}
    </p>
    <a href="/app" class="underline">Go back</a> to home page
  </div>
{/if}
