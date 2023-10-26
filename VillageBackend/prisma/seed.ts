import prisma from "../src/prismaClient";

async function main() {
  // seeding User table
  const randomUsers = Array.from({ length: 100 }).map((_, index) => {
    return prisma.users.create({
      data: {
        username: `user${index}`,
        email: `user${index}@example.com`,
        neighborhood_id: 1,
        building_id: 1,
      },
    });
  });

  await Promise.all(randomUsers);

  // seeding Post table
  const randomPosts = Array.from({ length: 1000 }).map((_, index) => {
    return prisma.posts.create({
      data: {
        user_id: (index % 20) + 1,
        neighborhood_id: 1,
        text_content: `post ${index}`,
      },
    });
  });

  await Promise.all(randomPosts);

  // seeding Comment table
  const randomComments = Array.from({ length: 1000 }).map((_, index) => {
    return prisma.comments.create({
      data: {
        user_id: (index % 20) + 1,
        post_id: (index % 100) + 1,
        text_content: `comment ${index}`,
      },
    });
  });

  await Promise.all(randomComments);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
