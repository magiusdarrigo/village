import { Prisma } from "@prisma/client";

export const getNotificationsByUserQuery = (
  currentUserID: string,
  lastNotificationID: number // cursor
) => {
  return Prisma.sql`
              SELECT 
                  notifications.*,
                  users.username AS from_username,
                  users.image AS from_profile_image
              FROM
                  notifications 
              INNER JOIN 
                  users ON notifications.from_user_id = users.id
              WHERE 
                  notifications.for_user_id = ${currentUserID} AND notifications.id < ${lastNotificationID}
              ORDER BY 
                  notifications.created_at DESC 
              LIMIT 10;
          `;
};
