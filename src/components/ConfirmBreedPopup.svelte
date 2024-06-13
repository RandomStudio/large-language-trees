<script lang="ts">
  import { goto } from "$app/navigation";
  import type {
    GeneratedImageResult,
    GeneratedImage,
    InsertPlant,
    GenerateImageRequest,
    AttachImageResponse
  } from "$lib/types";
  import { TOLERANCE_SIMPLE } from "../defaults/constants";
  import TransparencyMaker from "./TransparencyMaker.svelte";
  import ButtonBottom from "./ButtonBottom.svelte";
  export let candidateChild: InsertPlant;

  /** A local copy of the incoming "candidateChild", which we update as necessary before
   * returning to the parent component ready to add to the database.
   */
  let finalChildReadyToAdd: InsertPlant = { ...candidateChild };

  export let onCancel: () => any;
  export let onConfirm: (plantReadyToAdd: InsertPlant) => Promise<void>;

  let textInput = finalChildReadyToAdd.commonName || "";
  let waitingForImage = false;
  let candidateImageUrl: string | null = null;
  let errorText: string = "";

  function replaceInParagraph(
    paragraph: string | null | undefined,
    target: string | null | undefined,
    replacement: string | null
  ) {
    if (paragraph && target && replacement) {
      return paragraph.split(target).join(replacement) || null;
    } else {
      return null;
    }
  }

  async function handleAction() {
    if (textInput.trim() === "") {
      errorText = "Error : Please write something";
    } else {
      try {
        finalChildReadyToAdd.commonName = textInput;
        finalChildReadyToAdd.description = replaceInParagraph(
          finalChildReadyToAdd.description,
          finalChildReadyToAdd.commonName,
          textInput
        );
        await onConfirm(finalChildReadyToAdd);
        goto("../gallery");
      } catch (error) {
        console.error("Error during confirmation:", error);
      }
    }
  }

  function handleSubmit() {
    if (textInput.trim() === "") {
      console.log("Please write something");
      return;
    }

    console.log("Name given:", textInput);

    if (finalChildReadyToAdd.description && finalChildReadyToAdd.commonName) {
    }
    finalChildReadyToAdd.commonName = textInput;
  }

  const generateImage = async () => {
    waitingForImage = true;
    if (candidateChild.description) {
      const jsonBody: GenerateImageRequest = {
        description: candidateChild.description,
        plantId: candidateChild.id
      };
      const imageGenerationResponse = await fetch("/api/images/generate", {
        method: "POST",
        body: JSON.stringify(jsonBody)
      });
      waitingForImage = false;
      if (imageGenerationResponse.status == 200) {
        const json =
          (await imageGenerationResponse.json()) as GeneratedImageResult;
        const { url, pleaseWait } = json;
        if (pleaseWait === false && url) {
          console.log("got candidate image URL (ready):", url);
          replaceImage(url);
        } else {
          console.log("Request for image has been sent; poll for response");
          let polling: NodeJS.Timeout | null = setInterval(async () => {
            console.log("Checking for image...");

            const res = await fetch(
              `/api/plants/${candidateChild.id}/candidateImage`
            );

            if (res.status === 200) {
              const generated = (await res.json()) as GeneratedImage;
              const { plantId, url } = generated;
              console.log("Yes, a generated image exists for this plant!", {
                ...generated
              });
              const res2 = await fetch("/api/images/attach", {
                method: "POST",
                body: JSON.stringify({ plantId, url })
              });
              if (res2.status === 200) {
                const { url } = (await res2.json()) as AttachImageResponse;
                console.log("Image updated on backend OK, new S3 URL is:", url);
                replaceImage(url);
              } else {
                console.error(
                  "Failed to update image on backend:",
                  await res2.json()
                );
              }
              if (polling) {
                console.log("clear polling interval!");
                clearInterval(polling);
                polling = null;
              }
            }
          }, 2000);
        }
      } else {
        console.error("Error fetching generated new image");
      }
    }
  };

  function replaceImage(url: string) {
    console.log(
      "ConfirmBreedPopup replacing url",
      candidateImageUrl,
      "=>",
      url
    );
    candidateImageUrl = url;
    finalChildReadyToAdd.imageUrl = url;
  }

  const messages = [
    "Plants are being dug up",
    "The roots are intertwining",
    "DNA is being mixed up",
    "A new seed is created",
    "Watering the new plant",
    "Flowers are budding"
  ];
  let currentIndex = 0;

  setInterval(() => {
    if (currentIndex < messages.length - 1) {
      currentIndex = (currentIndex + 1) % messages.length;
    }
  }, 3000);

  generateImage();
</script>

{#if waitingForImage}
  <div
    class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-roel_green z-50"
  >
    <div class="flex flex-col items-center">
      <img
        src="/spinnerPlant.png"
        alt="Spinner"
        class="w-40 relative animate-spin"
        style="margin: auto;"
      />
      <div
        id="message"
        class="text-roel_blue font-inter text-xl mt-4 text-center"
      >
        {messages[currentIndex]} ...
      </div>
    </div>
  </div>
{/if}

{#if candidateImageUrl}
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-roel_green z-40">
    <div class="overflow-y-auto" style="max-height: calc(100% - 4rem);">
      <div class="mx-12 font-inter text-roel_blue text-left mt-10">
        <p class="text-xl">
          Hooray you made a new plant. What would you like it to be named?
        </p>

        <TransparencyMaker
          src={candidateImageUrl}
          useFloodFill={false}
          tolerance={TOLERANCE_SIMPLE}
          doUpload={true}
          onUploadComplete={replaceImage}
        />
        <div class="text-center">
          <form on:submit|preventDefault={handleSubmit} class="mt-2">
            <input
              type="text"
              bind:value={textInput}
              class="bg-light_grey border-2 px-4 py-2 border-mid_grey rounded-full font-inter text-dark_grey text-xl w-11/12 max-w-xs placeholder-dark_grey placeholder:font-inter text-center"
              placeholder="Name your flower"
            />
          </form>
        </div>
        <p class="mt-4 text-sm">{errorText}</p>
        <p class="mt-4 text-sm">{candidateChild.description}</p>

        <br />
        <br />
      </div>
    </div>
  </div>

  <ButtonBottom
    buttonText="Ok"
    functionClick={() => handleAction()}
    width="w-7/12"
  ></ButtonBottom>

  <button
    on:click={onCancel}
    class=" border-roel_green border-2 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent w-full hidden"
    >Cancel</button
  >
{/if}
