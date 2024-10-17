import type { PromptConfig } from "$lib/types";

const DefaultPrompt: PromptConfig = {
  text: {
    model: "gpt-4-turbo",
    template: `I manage to cross-pollinate two plants. Don't worry about whether this is physically possible in real life, but feel free to speculate on the likely outcome. I will describe each parent plant, and provide the name of the offspring, which I have already chosen. The new plant can derive some characteristics from its parents, but for its shape or flowers it should also take inspiration from its name: {NEW_PLANT_NAME}. The result can be weird and wonderful.

The first parent plant is "{PARENT1_COMMON_NAME}". {PARENT1_DESCRIPTION}

The second parent plant is "{PARENT2_COMMON_NAME}". {PARENT2_DESCRIPTION}

By cross-pollinating these two plants, I create a new plant which is named {NEW_PLANT_NAME}.

Let your imagination run wild, then present the new plant (the {NEW_PLANT_NAME}) in JSON format, with a key for "commonName", the height in metres ("heightInMetres"), the description of the new plant ("description") and a 1-sentence fun fact about the plant ("funFact").`
  },
  image: {
    model: "dall-e-3",
    template:
      "Create a 2D image of a {NEW_PLANT_NAME} plant from the following description. The plant is in the centre, standing alone on a pure white background. Make sure there is no text in the image. Here is the description: {DESCRIPTION}. But make it really {NEW_PLANT_NAME}."
  }
};

export default DefaultPrompt;
