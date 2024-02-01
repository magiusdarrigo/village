import * as admin from "firebase-admin";
import { initializeApp, ServiceAccount } from "firebase-admin/app";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not defined"
  );
}

const serviceAccountJSON = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString()
);

const serviceAccount: ServiceAccount = {
  clientEmail: serviceAccountJSON.client_email,
  privateKey: serviceAccountJSON.private_key,
  projectId: serviceAccountJSON.project_id,
};

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const sendNotification = async (
  title: string,
  body: string,
  token: string
) => {
  try {
    await admin.messaging().send({
      notification: {
        title,
        body,
      },
      token,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
