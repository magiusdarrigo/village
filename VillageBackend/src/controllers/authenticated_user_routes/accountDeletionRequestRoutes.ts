import { Router } from "express";
import prisma from "../../clients/prismaClient";

import { AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// check if user had a previous account deletion request
router.get("/", async (req, res) => {
  console.log("previous account deletion check called");
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: currentUser.id,
      },
    });
    const accountDeletionRequest =
      await prisma.account_deletion_requests.findFirst({
        where: {
          phone_number: user?.phone_number,
        },
      });

    // if accountDeletionRequest is not null, query for building and neighborhood
    if (!accountDeletionRequest) {
      return res.json(null);
    }

    const building = await prisma.buildings.findUnique({
      where: {
        id: accountDeletionRequest.building_id,
      },
      select: {
        id: true,
        neighborhood_id: true,
        address: true,
        neighborhood: {
          select: {
            name: true,
            is_locked: true,
          },
        },
      },
    });

    return res.json(building);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error checking previous account deletion request",
    });
  }
});

export default router;
