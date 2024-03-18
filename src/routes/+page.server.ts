import type { Plant } from "./types";

import type { Actions, PageServerLoad } from "./$types";

let seeds: Plant[] = [];

export const load: PageServerLoad = async ({ fetch }) => {
  const res = await fetch("/api");
  const seedsFromServer = await res.json();
  seeds = seedsFromServer;
  return { seeds: seedsFromServer, newSeed: null };
};

export const actions = {
  default: async ({ request }) => {
    // console.log("doing nothing, for now", request);
    const data = await request.formData();

    // const res = await fetch("/api", { method: "POST", body:  })
  },

  // create: async ({ request }) => {
  // const data = await request.formData();

  // const [id1, id2] = [data.get("parent1"), data.get("parent2")] as [
  //   string,
  //   string,
  // ];

  // console.log("looking for ids", id1, id2);
  // const plant1 = seeds?.find((s) => s.id === id1);
  // const plant2 = seeds?.find((s) => s.id === id2);

  // if (plant1 === undefined || plant2 === undefined) {
  //   // console.error({ seedsInMemory, id1, id2, data, plant1, plant2 });
  //   throw Error("Where are the parents?");
  // }

  // console.log("got request", plant1.commonName, "x", plant2.commonName);

  // const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // const completion = await openai.chat.completions.create({
  //   messages: [
  //     {
  //       role: "system",
  //       content:
  //         "You are a knowledgeable botanist with a flair for the imagination.",
  //     },
  //     {
  //       role: "user",
  //       content:
  //         'I manage to cross-pollinate two plants. Don\'t worry about whether this is physically possible in real life, but feel free to speculate on the likely outcome. I will describe each plant by giving its common name and by a brief description. This will be given in JSON form, with the keys "commonName" and "description" in both cases. With the information about the two parent plants, try to come up with a plausible new plant that would result from the cross-pollination.\n\n' +
  //         "First plant JSON:\n" +
  //         JSON.stringify(
  //           {
  //             commonName: plant1.commonName,
  //             description: plant1.description,
  //           },
  //           null,
  //           2,
  //         ) +
  //         "\n\n" +
  //         "Second plant JSON:\n" +
  //         JSON.stringify(
  //           {
  //             commonName: plant2.commonName,
  //             description: plant2.description,
  //           },
  //           null,
  //           2,
  //         ) +
  //         "\n\n" +
  //         'Describe the new plant that would result from the combination of these two. The new common name should not just be a simple combination of the two parent plant names - try to come up with a strange sounding name. Please give the result in the same JSON format, i.e. with a field "commonName" for the common name and "description" for the description. Do not include any text besides the JSON in your response.',
  //     },
  //   ],
  //   model: "gpt-3.5-turbo",
  // });

  // console.log("response:", completion.choices);

  // let offspring: Plant | null = null;

  // for (const res of completion.choices) {
  //   console.log(JSON.stringify(res));
  //   const formattedContent = res.message.content || "{}";

  //   offspring = parseNewPlant(formattedContent, [plant1.id, plant2.id]);
  //   if (offspring) {
  //     console.log("Offspring:", offspring);
  //   } else {
  //     throw Error("Oops, couldn't parse the offspring text");
  //   }
  // }

  // return { offspring };
  // },
} satisfies Actions;

// export const actions = {
//   default: async ({ request }) => {
//     const data = await request.formData();

//     const [id1, id2] = [data.get("parent1"), data.get("parent2")] as [
//       string,
//       string,
//     ];

//     // console.log("looking for ids", id1, id2);
//     const res = await fetch("/api");
//     const seeds = (await res.json()) as Plant[];

//     const plant1 = seeds?.find((s) => s.id === id1);
//     const plant2 = seeds?.find((s) => s.id === id2);

//     if (plant1 === undefined || plant2 === undefined) {
//       // console.error({ seedsInMemory, id1, id2, data, plant1, plant2 });
//       throw Error("Where are the parents?");
//     }

//     console.log("got request", plant1.commonName, "x", plant2.commonName);

//     const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

//     const completion = await openai.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a knowledgeable botanist with a flair for the imagination.",
//         },
//         {
//           role: "user",
//           content:
//             'I manage to cross-pollinate two plants. Don\'t worry about whether this is physically possible in real life, but feel free to speculate on the likely outcome. I will describe each plant by giving its common name and by a brief description. This will be given in JSON form, with the keys "commonName" and "description" in both cases. With the information about the two parent plants, try to come up with a plausible new plant that would result from the cross-pollination.\n\n' +
//             "First plant JSON:\n" +
//             JSON.stringify(
//               {
//                 commonName: plant1.commonName,
//                 description: plant1.description,
//               },
//               null,
//               2,
//             ) +
//             "\n\n" +
//             "Second plant JSON:\n" +
//             JSON.stringify(
//               {
//                 commonName: plant2.commonName,
//                 description: plant2.description,
//               },
//               null,
//               2,
//             ) +
//             "\n\n" +
//             'Describe the new plant that would result from the combination of these two. The new common name should not just be a simple combination of the two parent plant names - try to come up with a strange sounding name. Please give the result in the same JSON format, i.e. with a field "commonName" for the common name and "description" for the description. Do not include any text besides the JSON in your response.',
//         },
//       ],
//       model: "gpt-3.5-turbo",
//     });

//     console.log("response:", completion.choices);

//     for (const res of completion.choices) {
//       console.log(JSON.stringify(res));
//       const formattedContent = res.message.content || "{}";

//       const offspring = parseNewPlant(formattedContent, [plant1.id, plant2.id]);
//       if (offspring) {
//         console.log("Offspring:", offspring);
//       } else {
//         throw Error("Oops, couldn't parse the offspring text");
//       }
//     }
//   },
// } satisfies Actions;
