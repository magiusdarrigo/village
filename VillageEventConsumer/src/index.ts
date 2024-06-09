import "dotenv/config";
import amqp from "amqplib";
import { checkAbuse } from "./analyze";
import { banPost } from "./ban";
import { notifyUser, emailSupportAcctDeletionReq } from "./notify";
import {
  NewPostWebhookEvent,
  NewAccountDeletionRequestWebhookEvent,
} from "./types/custom";
import { deleteUser } from "./delete";
import { decrementFollowingCount, decrementFollowersCount } from "./counts";

const rabbitMQURL = process.env.RABBITMQ_PRIVATE_URL;
if (!rabbitMQURL) {
  throw new Error("Missing RABBITMQ_PRIVATE_URL env variable");
}

let channel: amqp.Channel;

async function connectRabbitMQ() {
  console.log("Connecting to RabbitMQ...");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const connection = await amqp.connect(rabbitMQURL);
  channel = await connection.createChannel();
  await channel.assertQueue("posts-queue", { durable: true });
  channel.prefetch(1);
}

async function consumeEvents() {
  channel.consume(
    "posts-queue",
    async (message) => {
      if (!message) {
        return;
      }

      const postEvent = JSON.parse(
        message.content.toString()
      ) as NewPostWebhookEvent;
      console.log("Received new post event:", postEvent);
      const ban = await checkAbuse(postEvent);
      if (!ban) {
        console.log(`post ${postEvent.record.id} is deemed not abusive.`);
        channel.ack(message);
        return;
      }
      console.log(`post ${postEvent.record.id} is deemed ABUSIVE.`);
      await banPost(postEvent);
      await notifyUser(postEvent);
      channel.ack(message);
    },
    { noAck: false }
  );

  channel.consume("account-deletion-queue", async (message) => {
    if (!message) {
      return;
    }

    const accountDeletionEvent = JSON.parse(
      message.content.toString()
    ) as NewAccountDeletionRequestWebhookEvent;
    console.log(
      "Received new account deletion request event:",
      accountDeletionEvent
    );
    const userID = accountDeletionEvent.record.user_id;
    await Promise.all([
      emailSupportAcctDeletionReq(userID),
      decrementFollowingCount(userID),
      decrementFollowersCount(userID),
    ]);
    await deleteUser(userID);
    // ack
    channel.ack(message);
  });
}

export async function init() {
  try {
    await connectRabbitMQ();
    console.log("Connected to RabbitMQ... Ready for consumption.");
    // consume from the queue
    await consumeEvents();
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
}

init();
