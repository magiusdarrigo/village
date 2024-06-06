import { Router } from "express";
import prisma from "../../clients/prismaClient";

import { AuthenticatedRequest } from "../../middleware/auth";
import { getProfilesFromPhoneNumbers } from "../../sql_queries/users";

const router = Router();

// get all users that match the phone numbers
router.post("/", async (req, res) => {
  console.log("get users from phone numbers");
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const phoneNumbers = req.body.phoneNumbers;
  try {
    const getProfilesFromPhoneNumbersSqlQuery = getProfilesFromPhoneNumbers(
      currentUser.id,
      phoneNumbers
    );
    const profiles = (await prisma.$queryRaw(
      getProfilesFromPhoneNumbersSqlQuery
    )) as any;
    res.json({ data: profiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching users from phone numbers",
    });
  }
});

export default router;
