import { invalidateAll } from "$app/navigation";
import type {
  AttachImageResponse,
  GeneratedImage,
  GenerateImageRequest,
  GeneratePlantRequestBody,
  InsertPlant,
  SelectCandidateText,
  SelectPlant
} from "$lib/types";

const checkCandidateTextReady = async (
  plantId: string
): Promise<InsertPlant | null> => {
  const exists = await fetch(`/api/plants/${plantId}/candidateText`);
  console.log("response status", exists.status);
  if (exists.status === 200) {
    const newPlant = (await exists.json()) as SelectCandidateText;
    const contents = newPlant.contents as string;
    return JSON.parse(contents) as InsertPlant;
  } else {
    return null;
  }
};

const awaitTimeout = async (t: number): Promise<void> =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, t);
  });

export async function startTextGeneration(
  userId: string,
  parents: [SelectPlant, SelectPlant]
): Promise<InsertPlant> {
  const jsonBody: GeneratePlantRequestBody = {
    userId,
    parents
  };
  const res = await fetch("/api/plants/generate", {
    method: "POST",
    body: JSON.stringify(jsonBody)
  });

  const jsonResponse = (await res.json()) as {
    backgroundResponse: any;
    newPlantId: string;
  };

  const newPlantId = jsonResponse.newPlantId;

  let candidatePlant = null;

  while (candidatePlant === null) {
    await awaitTimeout(2000);
    console.log("Check for candidate text generation...");
    candidatePlant = await checkCandidateTextReady(newPlantId);
  }

  console.log("... got a candidate plant!", candidatePlant);
  return candidatePlant;
}

export async function addConfirmedPlant(
  candidateChild: InsertPlant,
  gardenId: string,
  seedbankId: string
) {
  console.log(
    "Inserting new plant with ID",
    candidateChild.id,
    "and image",
    candidateChild.imageUrl,
    "..."
  );
  const { authorTop, authorBottom } = candidateChild;
  console.log("Some (generated) plant details:", { authorTop, authorBottom });
  const res = await fetch("/api/plants", {
    method: "POST",
    body: JSON.stringify(candidateChild)
  });
  const { status } = res;
  if (status === 201) {
    console.log(
      "Sucessfully created; also add to this user's Garden and Seedbank"
    );

    await fetch("/api/plantsInGarden", {
      method: "POST",
      body: JSON.stringify({ plantId: candidateChild.id, gardenId })
    });

    await fetch("/api/plantsInSeedbank", {
      method: "POST",
      body: JSON.stringify({ plantId: candidateChild.id, seedbankId })
    });

    // Reload data for page
    console.log("Reloading page data...");
    await invalidateAll();

    console.log("...done");
  } else {
    console.error("failed to add plant");
  }
}

/** Add the new plant to both the seedbank AND garden of the other user */
export async function addConfirmedPlantToOtherUser(
  candidateChild: InsertPlant,
  otherUserId: string
) {
  console.log("addConfirmedPlantToOtherUser", { otherUserId });
  await fetch("/api/plantsInSeedbank", {
    method: "POST",
    body: JSON.stringify({ plantId: candidateChild.id, userId: otherUserId })
  });
  await fetch("/api/plantsInGarden", {
    method: "POST",
    body: JSON.stringify({ plantId: candidateChild.id, userId: otherUserId })
  });
}

const generateImage = async (candidateChild: InsertPlant) => {
  // waitingForImage = true;
  if (candidateChild.description) {
    const jsonBody: GenerateImageRequest = {
      description: candidateChild.description,
      plantId: candidateChild.id
    };
    const imageGenerationResponse = await fetch("/api/images/generate", {
      method: "POST",
      body: JSON.stringify(jsonBody)
    });
    if (imageGenerationResponse.status == 202) {
      // 202: "Accepted" - image will be generated in the background
      console.log(
        "Request for image has been sent; poll for response (need to wait)"
      );
      // let polling: NodeJS.Timeout | null = setInterval(async () => {
      //   console.log("Checking for image...");

      //   const res = await fetch(
      //     `/api/plants/${candidateChild.id}/candidateImage`,
      //     {
      //       method: "GET"
      //     }
      //   );

      //   if (res.status === 200) {
      //     if (polling) {
      //       console.log("clear polling interval!");
      //       clearInterval(polling);
      //       polling = null;
      //     }

      //     const generated = (await res.json()) as GeneratedImage;
      //     const { plantId, url, errorMessage } = generated;
      //     if (errorMessage || url === null) {
      //       console.error("Image generation error:", errorMessage);
      //       throw Error("Something went wrong with the image generation");
      //     }
      //     console.log("Yes, a generated image exists for this plant!", {
      //       ...generated
      //     });
      //     const res2 = await fetch("/api/images/attach", {
      //       method: "POST",
      //       body: JSON.stringify({ plantId, url })
      //     });
      //     if (res2.status === 200) {
      //       const { url } = (await res2.json()) as AttachImageResponse;
      //       console.log("Image updated on backend OK, new S3 URL is:", url);
      //       // replaceImage(url);
      //     } else {
      //       throw Error("error updating image on backend");
      //     }

      //   } else {
      //     console.log("Got status code", res.status, "; try again...");
      //   }

      // }, 2000);
    } else {
      throw Error("Error requesting new image generation");
    }
  }
};

// async function insertNewPlant(updatedPlant: InsertPlant) {
//   if (candidateChild && otherUserId) {
//     candidateChild = updatedPlant;
//     candidateChild.authorTop = data.user.id;
//     candidateChild.authorBottom = otherUserId;
//     console.log(
//       "insertNewPlant setting authorTop = ",
//       data.user.id,
//       ", authorBottom = ",
//       otherUserId
//     );
//     await addConfirmedPlant(candidateChild, data.garden.id, data.seedbank.id);
//     await addConfirmedPlantToOtherUser(candidateChild, otherUserId);

//     const event: EventNewPollination = {
//       name: "newPlantPollination",
//       payload: candidateChild
//     };
//     const eventRes = await fetch("/api/events", {
//       method: "POST",
//       body: JSON.stringify(event)
//     });
//     console.log("event response:", eventRes.status, eventRes.statusText);

//     candidateChild = null;
//     busy = false;
//   } else {
//     console.error("Missing data", { candidateChild, otherUserId });
//   }
// }
