<script lang="ts">
  import { goto } from "$app/navigation";
  import type {
    GeneratedImageResult,
    GeneratedImage,
    InsertPlant,
    AttachImageResponse
  } from "$lib/types";
  import { TOLERANCE_SIMPLE } from "../../../../defaults/constants";
  import TransparencyMaker from "../../../../components/TransparencyMaker.svelte";
  import ButtonBottom from "../../../../components/ButtonBottom.svelte";
  import WaitingSpinner from "../../../../components/WaitingSpinner.svelte";
  import PopupError from "../../../../components/PopupError.svelte";
  import { type GenerateImageRequest } from "../../../api/images/generate/types";

  export let candidateChild: InsertPlant;

  let error: boolean = false;

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
    paragraph: string,
    target: string,
    replacement: string
  ) {
    if (paragraph && target && replacement) {
      return paragraph.split(target).join(replacement) || paragraph;
    } else {
      return paragraph;
    }
  }

  async function handleAction() {
    if (textInput.trim() === "") {
      errorText = "Error : Please write something";
    } else {
      try {
        const previousCommonName = finalChildReadyToAdd.commonName;
        finalChildReadyToAdd.commonName = textInput;
        finalChildReadyToAdd.description = replaceInParagraph(
          finalChildReadyToAdd.description,
          previousCommonName,
          textInput
        );
        await onConfirm(finalChildReadyToAdd);
        goto("../");
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

    //@ts-ignore
    umami.track("Named Plant");
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
      if (imageGenerationResponse.status == 200) {
        const json =
          (await imageGenerationResponse.json()) as GeneratedImageResult;
        const { url, pleaseWait } = json;
        if (pleaseWait === false && url) {
          console.log(
            "No need to wait, here's the URL: got candidate image URL (ready):",
            url
          );
          replaceImage(url);
        } else {
          console.log(
            "Request for image has been sent; poll for response (need to wait)"
          );
          let polling: NodeJS.Timeout | null = setInterval(async () => {
            console.log("Checking for image...");

            const res = await fetch(
              `/api/plants/${candidateChild.id}/candidateImage`,
              {
                method: "GET"
              }
            );

            if (res.status === 200) {
              if (polling) {
                console.log("clear polling interval!");
                clearInterval(polling);
                polling = null;
              }

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
                console.error("   update image on backend:", await res2.json());
              }
            } else {
              console.log("Got status code", res.status, "; try again...");
            }
          }, 2000);
        }
      } else {
        console.error("Error fetching generated new image");
        error = true;
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
      <WaitingSpinner></WaitingSpinner>
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
          onUploadComplete={(url) => {
            replaceImage(url);
            waitingForImage = false;
          }}
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
    data-umami-event="Cancel Pollination Button"
    on:click={onCancel}
    class=" border-roel_green border-2 rounded-full focus:outline-none focus:bg-transparent active:bg-transparent w-full hidden"
    >Cancel</button
  >
{/if}

{#if error}
  <PopupError {candidateChild} {onCancel} {onConfirm}></PopupError>
{/if}
