import { Router } from "express";
import prisma from "../../clients/prismaClient";
import twilioClient from "../../clients/twilioClient";

const router = Router();
const jwt = require("jsonwebtoken");

// new phone number not seen before -> create new user
router.post("/login", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).send("Phone number is required.");
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generates a 6-digit code

  try {
    // check if phone number exists in users table
    const user = await prisma.users.findUnique({
      where: {
        phone_number: phoneNumber,
      },
    });

    // if phone number exists, then the user is logging in. update the user's otp
    if (user) {
      await prisma.users.update({
        where: {
          phone_number: phoneNumber,
        },
        data: {
          otp,
        },
      });
    } else {
      // if phone number does not exist, then the user is signing up. create a new user
      const username =
        Math.random().toString(36).substring(2, 5) +
        Math.random().toString(36).substring(2, 12);

      await prisma.users.create({
        data: {
          username,
          phone_number: phoneNumber,
          otp,
        },
      });
    }

    // Send OTP using Twilio
    await twilioClient.messages.create({
      body: `Your Village OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    res.send("OTP sent successfully.");
  } catch (error) {
    console.error("Error in login handler:", error);
    res.status(500).send("Internal Server Error.");
  }
});

router.post("/validate", async (req, res) => {
  const phoneNumber = req.body.phone_number;
  const userOTP = req.body.otp;

  if (!phoneNumber || !userOTP) {
    return res.status(400).send("Phone number and OTP are required.");
  }

  try {
    // Fetch the OTP from the database for the given phone number
    const result = await prisma.users.findUnique({
      where: {
        phone_number: phoneNumber,
      },
      select: {
        otp: true,
        id: true,
      },
    });

    const storedOTP = result?.otp;
    const userID = result?.id;

    if (!storedOTP) {
      return res.status(404).send("User not found.");
    }

    if (storedOTP !== userOTP) {
      return res.status(400).send("Invalid OTP.");
    }

    // If the OTP is valid, generate a JWT and send it back
    const token = jwt.sign(
      { role: "user", phone: phoneNumber, userID },
      process.env.JWT_SECRET
    );

    // invalidate/delete the OTP from the database after successful verification
    await prisma.users.update({
      where: {
        phone_number: phoneNumber,
      },
      data: {
        otp: null,
      },
    });

    res.json({ token }); // Send the JWT to the client
  } catch (error) {
    console.error("Error in validate handler:", error);
    res.status(500).send("Internal Server Error.");
  }
});

export default router;
