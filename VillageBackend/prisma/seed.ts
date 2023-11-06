import prisma from "../src/clients/prismaClient";

async function main() {
  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // seed the neighborhoods table with the top New York neighborhoods
  const neighborhoods = [
    "Chelsea",
    "Chinatown",
    "East Village",
    "Fidi",
    "Flatiron",
    "Gramercy",
    "Greenwich",
    "Harlem",
    "Hell's Kitchen",
    "Hudson Yards",
    "Little Italy",
    "LES",
    "Midtown East",
    "Nolita",
    "SoHo",
    "Tribeca",
    "Upper East Side",
    "Upper West Side",
    "West Village",
    "Williamsburg",
  ];
  const neighborhoodPromises = neighborhoods.map((neighborhood) => {
    return prisma.neighborhoods.create({
      data: {
        name: neighborhood,
      },
    });
  });

  await Promise.all(neighborhoodPromises);

  // seed the buildings table with 25 buildings (5 buildings per neighborhood)
  const randomBuildings = Array.from({ length: 25 }).map((_, index) => {
    return prisma.buildings.create({
      data: {
        address: `address #${index}`,
        neighborhood_id: (index % 5) + 1,
      },
    });
  });

  await Promise.all(randomBuildings);

  // seed the users table with 100 users (20 users per building)
  const randomUsers = Array.from({ length: 100 }).map((_, index) => {
    return prisma.users.create({
      data: {
        username: `user${index}`,
        phone_number: `+1-000-${index}`,
        neighborhood_id: (index % 5) + 1,
        building_id: (index % 25) + 1,
        image: "https://picsum.photos/150",
      },
    });
  });

  await Promise.all(randomUsers);

  // seed the posts table with 500 posts (first 20 users will have 25 posts each)
  const randomPosts = Array.from({ length: 500 }).map((_, index) => {
    return async () => {
      await sleep(1); // Sleep for 1 ms
      await prisma.posts.create({
        data: {
          user_id: (index % 20) + 1,
          neighborhood_id: (index % 5) + 1,
          text_content: `post ${index}`,
        },
      });
    };
  });

  for (const createPost of randomPosts) {
    await createPost();
  }

  // TODO: comment count on posts have to be updated too if i want to use this seed.
  // // seed the comments table with 50 comments (first 20 users comment on the first 5 posts)
  // // so post id 1 will have 10 comments.
  // const randomComments = Array.from({ length: 50 }).map((_, index) => {
  //   return async () => {
  //     await sleep(1); // Sleep for 1 ms
  //     await prisma.comments.create({
  //       data: {
  //         user_id: (index % 20) + 1,
  //         post_id: (index % 5) + 1,
  //         text_content: `comment ${index}`,
  //       },
  //     });
  //   };
  // });

  // for (const createComment of randomComments) {
  //   await createComment();
  // }

  // TODO: comment count on posts have to be updated too if i want to use this seed.
  // // seed the comments table with 51 replies (all on the comments of the first post, first 20 users reply to the first 5 comments)
  // // so comment id 1 will have 11 replies, other comments will have 10 replies.
  // const randomReplies = Array.from({ length: 51 }).map((_, index) => {
  //   return async () => {
  //     await sleep(1); // Sleep for 1 ms
  //     await prisma.comments.create({
  //       data: {
  //         user_id: (index % 20) + 1,
  //         post_id: 1,
  //         parent_comment_id: (index % 5) + 1,
  //         text_content: `reply ${index}`,
  //       },
  //     });
  //   };
  // });

  //   for (const createReply of randomReplies) {
  //     await createReply();
  //   }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
