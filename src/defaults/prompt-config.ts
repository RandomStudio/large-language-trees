import type { PromptConfig } from "$lib/types";

const DefaultPrompt: PromptConfig = {
  text: {
    model: "gpt-4-turbo",
    preamble: {
      label: "Preamble",
      description:
        "Give the AI a scenario, or a general idea of how they should approach your instructions, or what persona they should take on.",
      text: "Imagine you are a knowledgeable botanist with a flair for descriptive writing, and an interest in science fiction and celebrities."
    },
    explanation: {
      label: "Explanation",
      description:
        "Lay out exactly what you are going to provide (the two parent plants), the data format that will be used (JSON) and what the AI needs to do with it (combine properties, etc.). The actual properties of each parent plant will follow directly after this.",
      text: 'I manage to cross-pollinate two plants. Don\'t worry about whether this is physically possible in real life, but feel free to speculate on the likely outcome. I will describe each parent plant in JSON form, giving its common name and by a brief description, followed by a set of key-value pairs for "properties". With the information about the two parent plants, try to come up with a plausible new plant that would result from the cross-pollination.'
    },
    instructions: {
      label: "Final Instructions",
      description:
        "Remind the AI what you are looking for (combining the two plants) and, if necessary, remind them of the fields (keys) that you expect to see. Definitely state that you only want pure JSON in the response, no other text. The maximum word count should be 200.",
      text: 'Describe the new plant that would result from the combination of these two. The new common name should not just be a simple combination of the two parent plant names - try to come up with a strange sounding name. Please give the result in the same JSON format, i.e. with a field "commonName\'" for the common name and a set of key-value pairs for the new "properties". Also add a "description" field with a short paragraph (about three sentences) that describes the new plant referencing the characteristics you came up with, but feel free to invent some details if you like. Do not include any text besides the JSON in your response.'
    }
  },
  image: {
    model: "dall-e-3",
    instructions:
    "You are a botanist. Create a 2D image of a plant from the following description. The plant is in the centre, standing alone on a pure white background. Make sure there is no text in the image. There is only the plant in the middle of the picture. Here is the description:"
  }
};

export default DefaultPrompt;
