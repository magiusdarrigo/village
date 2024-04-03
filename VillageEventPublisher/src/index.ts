import express, { Request, Response } from "express";
import "dotenv/config";
import amqp from "amqplib";

const app = express();
const port = process.env.PORT;
if (!port) {
  throw new Error("Missing PORT env variable");
}

const rabbitMQURL = process.env.RABBITMQ_PRIVATE_URL;
if (!rabbitMQURL) {
  throw new Error("Missing RABBITMQ_PRIVATE_URL env variable");
}

app.use(express.json());

let channel: amqp.Channel;

async function connectRabbitMQ() {
  console.log("Connecting to RabbitMQ...");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const connection = await amqp.connect(rabbitMQURL);
  channel = await connection.createChannel();
  await channel.assertQueue("posts-queue");
}

app.post("/newpost", async (req: Request, res: Response) => {
  const postEvent = req.body;
  console.log("Received new post event:", postEvent);

  channel.sendToQueue("posts-queue", Buffer.from(JSON.stringify(postEvent)));
  res.status(200).send("Post event received and published");
});

async function init() {
  try {
    await connectRabbitMQ();
    console.log("Connected to RabbitMQ");
    app.listen(port, () => {
      console.log(
        `VillageEventPublisher listening at http://localhost:${port}`
      );
    });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ or start the server:", error);
    process.exit(1);
  }
}

init();
