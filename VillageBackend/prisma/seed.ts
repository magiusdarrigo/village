import prisma from "../src/prismaClient";

async function main() {
  // seeding User table
  const randomUsers = Array.from({ length: 100 }).map((_, index) => {
    return prisma.users.create({
      data: {
        username: `user${index}`,
        email: `user${index}@example.com`,
        neighborhoodID: 1,
        buildingID: 1,
      },
    });
  });

  await Promise.all(randomUsers);

  // seeding Post table
  const randomPosts = Array.from({ length: 1000 }).map((_, index) => {
    return prisma.posts.create({
      data: {
        userID: (index % 20) + 1,
        neighborhoodID: 1,
        textContent: `post ${index}`,
      },
    });
  });

  await Promise.all(randomPosts);

  // seeding Comment table
  const randomComments = Array.from({ length: 1000 }).map((_, index) => {
    return prisma.comments.create({
      data: {
        userID: (index % 20) + 1,
        postID: (index % 100) + 1,
        textContent: `comment ${index}`,
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
