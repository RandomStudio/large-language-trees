const dummyTimeout = async (ms: number) =>
  new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    });
  });

export default async (req: Request) => {
  const { prompt, backgroundSecret } = await req.json();

  const ms = 20000;

  console.log("Waiting", ms, "ms...");

  await dummyTimeout(ms);

  console.log("...done");
};
