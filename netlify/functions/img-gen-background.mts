interface BackgroundGenerateImageRequest {
  plantId: string;
  fullPrompt: string;
  model: string;
  backgroundSecret: string;
}

export default async (req: Request) => {
  const requestBody = (await req.json()) as BackgroundGenerateImageRequest;
  const { fullPrompt, backgroundSecret, plantId, model } = requestBody;

  const apiKey = process.env.OPENAI_API_KEY;
  const realSecret = process.env.BACKGROUND_FN_SECRET;
  const useLocalApi = process.env.BACKGROUND_FN_USES_LOCAL_API;

  if (backgroundSecret !== realSecret) {
    console.error("Secrets do not match:", { backgroundSecret, realSecret });
    throw Error("Hey, that's not the correct super secret key!");
  }

  const jsonBody = {
    model,
    prompt: fullPrompt,
    n: 1,
    size: "1024x1024"
  };

  console.log("Using body", jsonBody, "...");

  const aiRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(jsonBody)
  });

  console.log("Got response from OpenAI API:", aiRes);

  if (aiRes.status === 200) {
    const jsonResponse = await aiRes.json();
    console.log({ jsonResponse });
    const url = jsonResponse.data[0].url as string;
    console.log({ url });

    const origin = useLocalApi || "https://livinggarden.netlify.app";
    console.log("POST to", origin);

    const addImageToDbRes = await fetch(
      `${origin}/api/plants/${plantId}/candidateImage`,
      {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ url }),
        headers: {
          origin
        }
      }
    );
    if (addImageToDbRes.status === 200 || addImageToDbRes.status === 201) {
      console.log("Success!");
    } else {
      const { statusText, status } = addImageToDbRes;
      console.error("Something went wrong when POSTing to our API endpoint:", {
        statusText,
        status
      });
      console.error(addImageToDbRes);
    }
  } else {
    const { statusText, status } = aiRes;
    console.error("Something went wrong in request to openAI API:", {
      statusText,
      status,
      apiKey
    });
  }

  console.log("...done");
};
