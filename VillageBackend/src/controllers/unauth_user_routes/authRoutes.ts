import { Router } from "express";
import prisma from "../../clients/prismaClient";
import twilioClient from "../../clients/twilioClient";

const router = Router();
const jwt = require("jsonwebtoken");
const PHONE_TOKEN_EXPIRY_MINUTES = 2;

// new phone number not seen before -> create new user
router.post("/login", async (req, res) => {
  const { phoneNumber } = req.body;

  if (typeof phoneNumber !== "string") {
    return res.status(400).send("Phone number incorrect.");
  }

  // Generate OTP (6-digit code)
  const phoneToken = Math.floor(100000 + Math.random() * 900000).toString();
  const expiration = new Date(
    new Date().getTime() + 1000 * 60 * PHONE_TOKEN_EXPIRY_MINUTES
  ); // 2 minutes

  try {
    // TODO: change this to be unique
    const username =
      Math.random().toString(36).substring(2, 5) +
      Math.random().toString(36).substring(2, 12);

    await prisma.tokens.create({
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
    });

    // Send OTP using Twilio
    await twilioClient.messages.create({
      body: `Your Village OTP is: ${phoneToken}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    res.send("OTP sent successfully.");
  } catch (error) {
    console.error("Error in login handler:", error);
    res.status(500).send("Internal Server Error.");
  }
});

router.post("/authenticate", async (req, res) => {
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
      return res.status(401).send("Invalid OTP.");
    }

    if (dbPhoneToken.expiration && dbPhoneToken.expiration < new Date()) {
      return res.status(401).send("OTP expired.");
    }

    if (dbPhoneToken?.user?.phone_number !== phoneNumber) {
      return res.status(401);
    }

    // invalidate phone token
    const invalidToken = await prisma.tokens.update({
      where: {
        id: dbPhoneToken.id,
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

export default router;
