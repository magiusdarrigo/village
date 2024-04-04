import "dotenv/config";
import amqp from "amqplib";

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
    (message) => {
      if (!message) {
        return;
      }

      const postEvent = JSON.parse(message.content.toString());
      console.log("Received new post event:", postEvent);
      channel.ack(message);
    },
    { noAck: false }
  );
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
