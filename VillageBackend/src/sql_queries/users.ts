import { Prisma } from "@prisma/client";
import prisma from "../clients/prismaClient";

export const getUserProfileQuery = (userID: string, userToGetID: string) => {
  return Prisma.sql`
              SELECT
                  users.id,
                  users.username,
                  users.image,
                  users.followers_count,
                  users.following_count,
                  neighborhoods.name AS neighborhood_name,
                  CASE WHEN user_following.id IS NOT NULL THEN TRUE ELSE FALSE END AS followed_by_user
              FROM
                  users
              LEFT JOIN
                  user_following ON users.id = user_following.following_user_id AND user_following.follower_user_id = ${userID}
              LEFT JOIN
                  neighborhoods ON users.neighborhood_id = neighborhoods.id
              WHERE
                  users.id = ${userToGetID};
          `;
};

export const getUserFollowers = (
  userID: string,
  userToGetID: string,
  lastFollowerID: number // cursor
) => {
  return Prisma.sql`
      SELECT 
          user_following.id,
          user_following.follower_user_id,
          users.username,
          users.image AS profile_image,
          user_following.created_at,
          neighborhoods.name AS neighborhood_name,
          CASE 
              WHEN (SELECT COUNT(*) 
                    FROM user_following AS uf 
                    WHERE uf.follower_user_id = ${userID} 
                    AND uf.following_user_id = user_following.follower_user_id) > 0 
              THEN TRUE ELSE FALSE END AS followed_by_user
      FROM 
          user_following
      INNER JOIN 
          users ON user_following.follower_user_id = users.id
      LEFT JOIN 
          neighborhoods ON users.neighborhood_id = neighborhoods.id
      WHERE 
          user_following.following_user_id = ${userToGetID}
          AND user_following.id < ${lastFollowerID}
      ORDER BY 
          user_following.created_at DESC 
      LIMIT 10;
    `;
};

export const getUserFollowing = (
  userID: string,
  userToGetID: string,
  lastFollowingID: number // cursor
) => {
  return Prisma.sql`
      SELECT 
          user_following.id,
          user_following.following_user_id,
          users.username,
          users.image AS profile_image,
          user_following.created_at,
          neighborhoods.name AS neighborhood_name,
          CASE 
              WHEN (SELECT COUNT(*) 
                    FROM user_following AS uf 
                    WHERE uf.follower_user_id = ${userID} 
                    AND uf.following_user_id = user_following.following_user_id) > 0 
              THEN TRUE ELSE FALSE END AS followed_by_user
      FROM 
          user_following
      INNER JOIN 
          users ON user_following.following_user_id = users.id
      LEFT JOIN 
          neighborhoods ON users.neighborhood_id = neighborhoods.id
      WHERE 
          user_following.follower_user_id = ${userToGetID}
          AND user_following.id < ${lastFollowingID}
      ORDER BY 
          user_following.created_at DESC 
      LIMIT 10;
    `;
};

export const getProfilesFromPhoneNumbers = (
  userID: string,
  phoneNumbers: string[]
) => {
  const phoneNumberList = phoneNumbers
    .map((num) => `'${num.replace(/'/g, "''")}'`)
    .join(",");
  return Prisma.sql`
        SELECT 
            users.id,
            users.id AS follower_user_id,
            users.username,
            users.image AS profile_image,
            neighborhoods.name AS neighborhood_name,
            CASE 
                WHEN (SELECT COUNT(*) 
                        FROM user_following AS uf 
                        WHERE uf.follower_user_id = ${userID} 
                        AND uf.following_user_id = users.id) > 0 
                THEN TRUE ELSE FALSE END AS followed_by_user
        FROM 
            users
        LEFT JOIN 
            neighborhoods ON users.neighborhood_id = neighborhoods.id
        WHERE 
            users.phone_number = ANY(ARRAY[${phoneNumberList}]::text[])
        `;
};
