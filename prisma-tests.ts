import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Finding...");
  const plants = await prisma.plants.findMany({
    include: {
      users_plants_author_bottomTousers: true,
      users_plants_author_topTousers: true
    }
  });
  console.dir(plants, { depth: null });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
