import { Prisma } from "@prisma/client";

export const getUserProfileQuery = (userID: string, userToGetID: string) => {
  return Prisma.sql`
                  SELECT
                      users.id,
                      users.username, 
                      users.image,
                      users.followers_count,
                      users.following_count,
                      CASE WHEN user_following.id IS NOT NULL THEN TRUE ELSE FALSE END AS followed_by_user 
                  FROM 
                      users
                  LEFT JOIN 
                    user_following ON users.id = user_following.following_user_id AND user_following.follower_user_id = ${userID}
                  WHERE 
                      users.id = ${userToGetID};
              `;
};
