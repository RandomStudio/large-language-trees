export interface PromptSection {
  label: string;
  description: string;
  text: string;
}
export interface PromptConfig {
  text: {
    model: "gpt-3.5-turbo" | "gpt-4-turbo";
    preamble: PromptSection;
    explanation: PromptSection;
    instructions: PromptSection;
  };
  image: {
    model: "dall-e-3";
    instructions: string;
  };
}

const DefaultPrompt: PromptConfig = {
  text: {
    model: "gpt-3.5-turbo",
    preamble: {
      label: "Preamble",
      description:
        "Give the AI a scenario, or a general idea of how they should approach your instructions, or what persona they should take on.",
      text: "You are a knowledgeable botanist"
    },
    explanation: {
      label: "Explanation",
      description:
        "Lay out exactly what you are going to provide (the two parent plants), the data format that will be used (JSON) and what the AI needs to do with it (combine properties, etc.). The actual properties of each parent plant will follow directly after this.",
      text: 'You managed to cross-pollinate two plants. Don\'t worry about whether this is physically possible in real life, but feel free to speculate on the likely outcome. I will describe each parent plant in JSON form, giving its common name and by a brief description, followed by a set of key-value pairs for "properties". With the information about the two parent plants, try to come up with a plausible new plant that would result from the cross-pollination.'
    },
    instructions: {
      label: "Final Instructions",
      description:
        "Remind the AI what you are looking for (combining the two plants) and, if necessary, remind them of the fields (keys) that you expect to see. Definitely state that you only want pure JSON in the response, no other text. The maximum word count should be 200.",
      text: 'Describe the new plant that would result from the result of the crosspollination of these two. Please give the result in the same JSON format, i.e. with a field "commonName\'" for the common name and a set of key-value pairs for the new "properties". Also add a "description" field with a short paragraph (around three sentences) describing the plant\'s physical characteristics in very precise terms. Do not include any text besides the JSON in your response.'
    }
  },
  image: {
    model: "dall-e-3",
    instructions:
      "Create a precise pixel art 8-bit image based on the following description. The background is pure white, with no text, no stars and the plant is standing alone in the middle. Here is the description:"
  }
};  

export default DefaultPrompt;
