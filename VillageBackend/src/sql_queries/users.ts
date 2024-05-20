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

export const getUserFollowers = (
  userID: string,
  lastFollowerID: number // cursor
) => {
  return Prisma.sql`
            SELECT 
                user_following.id,
                user_following.follower_user_id,
                users.username,
                users.image AS profile_image,
                user_following.created_at,
                neighborhoods.name AS neighborhood_name
            FROM 
                user_following
            INNER JOIN 
                users ON user_following.follower_user_id = users.id
            LEFT JOIN 
                neighborhoods ON users.neighborhood_id = neighborhoods.id
            WHERE 
                user_following.following_user_id = ${userID}
                AND user_following.id < ${lastFollowerID}
            ORDER BY 
                user_following.created_at DESC 
            LIMIT 10;
        `;
};

export const getUserFollowing = (
  userID: string,
  lastFollowingID: number // cursor
) => {
  return Prisma.sql`
        SELECT 
            user_following.id,
            user_following.following_user_id,
            users.username,
            users.image AS profile_image,
            user_following.created_at,
            neighborhoods.name AS neighborhood_name
        FROM 
            user_following
        INNER JOIN 
            users ON user_following.following_user_id = users.id
        LEFT JOIN 
            neighborhoods ON users.neighborhood_id = neighborhoods.id
        WHERE 
            user_following.follower_user_id = ${userID}
            AND user_following.id < ${lastFollowingID}
        ORDER BY 
            user_following.created_at DESC 
        LIMIT 10;
    `;
};
