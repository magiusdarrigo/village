import { Router } from "express";
import prisma from "../../clients/prismaClient";
import twilioClient from "../../clients/twilioClient";
import streamChatClient from "../../clients/streamChatClient";

const router = Router();
const jwt = require("jsonwebtoken");
const PHONE_TOKEN_EXPIRY_MINUTES = 2;
const CURRENT_APP_VERSION = "1.0.0";

// new phone number not seen before -> create new user
router.post("/login", async (req, res) => {
  const { phoneNumber } = req.body;
  console.log("login called, with number: ", phoneNumber);

  if (typeof phoneNumber !== "string") {
    return res.status(400).send("Phone number incorrect.");
  }

  // Generate OTP (6-digit code)
  const phoneToken = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("phone token: ", phoneToken);
  const expiration = new Date(
    new Date().getTime() + 1000 * 60 * PHONE_TOKEN_EXPIRY_MINUTES
  ); // 2 minutes

  try {
    // create a random 10 character username
    const username = Math.random().toString(36).substring(2, 15);

    const userWithToken = await prisma.tokens.create({
      data: {
        type: "PHONE",
        phone_token: phoneToken,
        expiration,
        user: {
          connectOrCreate: {
            where: {
              phone_number: phoneNumber,
            },
            create: {
              username,
              phone_number: phoneNumber,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            is_verified: true,
            followers_count: true,
            following_count: true,
            neighborhood_id: true,
            building_id: true,
            chat_token: true,
            blocked_users: true,
            neighborhood: {
              select: {
                name: true,
                is_locked: true,
              },
            },
            building: {
              select: {
                address: true,
              },
            },
          },
        },
      },
    });

    const user = userWithToken.user;

    if (!user.chat_token) {
      const chatToken = streamChatClient.createToken(user.id);
      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          chat_token: chatToken,
        },
      });
    }

    // Send OTP using Twilio
    await twilioClient.messages.create({
      body: `Your Village OTP is: ${phoneToken}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `${phoneNumber}`, // +1 (123) 456-7890
    });

    res.send(user);
  } catch (error) {
    console.error("Error in login handler:", error);
    res.status(500).send("Internal Server Error.");
  }
});

router.post("/authenticate", async (req, res) => {
  console.log("authenticate called");
  const phoneNumber = req.body.phoneNumber;
  const phoneToken = req.body.phoneToken;

  if (!phoneNumber || !phoneToken) {
    return res.status(400).send("Phone number and OTP are required.");
  }

  try {
    // Fetch the OTP from the database for the given phone number
    const dbPhoneToken = await prisma.tokens.findUnique({
      where: {
        phone_token: phoneToken,
      },
      include: {
        user: true,
      },
    });

    if (!dbPhoneToken || !dbPhoneToken.valid) {
      console.log("Invalid OTP");
      return res.status(401).send("Invalid OTP.");
    }

    if (dbPhoneToken.expiration && dbPhoneToken.expiration < new Date()) {
      console.log("OTP expired");
      return res.status(401).send("OTP expired.");
    }

    if (dbPhoneToken?.user?.phone_number !== phoneNumber) {
      console.log("Phone number mismatch");
      return res.status(401);
    }

    // invalidate phone token
    const invalidToken = await prisma.tokens.update({
      where: {
        id: dbPhoneToken?.id,
      },
      data: {
        valid: false,
      },
    });

    // If the OTP is valid, generate a JWT and send it back
    const token = jwt.sign(
      {
        role: "user",
        phone: phoneNumber,
        id: invalidToken.user_id,
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        noTimestamp: true,
      }
    );

    res.send({ token });
  } catch (error) {
    console.error("Error in validate handler:", error);
    res.status(500).send("Internal Server Error.");
  }
});

// return the current version of the app
router.get("/version", async (_, res) => {
  console.log("check version called");
  try {
    res.send({ mandatoryUpdate: true, latestVersion: CURRENT_APP_VERSION });
  } catch (error) {
    console.error("Error in version handler:", error);
    res.status(500).send("Internal Server Error.");
  }
});

export default router;
