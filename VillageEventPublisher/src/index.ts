import express, { Request, Response } from "express";
import amqp from "amqplib";

const app = express();
app.use(express.json());
const port = 3002;

const rabbitMQURL = process.env.RABBITMQ_PRIVATE_URL ?? "";
let channel: amqp.Channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(rabbitMQURL);
  channel = await connection.createChannel();
  await channel.assertQueue("postsQueue"); // Ensure the queue exists
}

// Connect to RabbitMQ when the server starts
connectRabbitMQ()
  .then(() => {
    console.log("Connected to RabbitMQ");
  })
  .catch((err) => {
    console.error("Failed to connect to RabbitMQ", err);
  });

app.post("/newpost", async (req: Request, res: Response) => {
  const postEvent = req.body;
  console.log("Received new post event:", postEvent);

  if (!channel) {
    console.error("RabbitMQ channel not initialized");
    return res.status(500).send("Server error");
  }

  channel.sendToQueue("postsQueue", Buffer.from(JSON.stringify(postEvent)));
  res.status(200).send("Post event received and published");
});

app.listen(port, () => {
  console.log(`VillageEventPublisher listening at http://localhost:${port}`);
});
