import express, { Request, Response } from "express";
import "dotenv/config";
import amqp from "amqplib";
import { Resend } from "resend";
import {
  NewAccountDeletionRequestWebhookEvent,
  NewBuildingChangeRequestWebhookEvent,
  NewReportedPostWebhookEvent,
  NewReportedCommentWebhookEvent,
} from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);
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
  await channel.assertQueue("posts-queue", { durable: true });
}

// new post made by a user. Send this event to the posts-queue
app.post("/newpost", async (req: Request, res: Response) => {
  const postEvent = req.body;
  console.log("Received new post event:", postEvent);

  channel.sendToQueue("posts-queue", Buffer.from(JSON.stringify(postEvent)), {
    persistent: true,
  });
  res.status(200).send("Post event received and published");
});

// new account deletion request. Send a email to support
app.post("/newaccountdeletionrequest", async (req: Request, res: Response) => {
  const accountDeletionRequestEvent =
    req.body as NewAccountDeletionRequestWebhookEvent;
  console.log(
    "Received new account deletion request event:",
    accountDeletionRequestEvent
  );

  channel.sendToQueue(
    "account-deletion-queue",
    Buffer.from(JSON.stringify(accountDeletionRequestEvent)),
    {
      persistent: true,
    }
  );
  res.status(200).send("Account deletion request event received and published");
});

// new building change request. Send a email to support
app.post("/newbuildingchangerequest", async (req: Request, res: Response) => {
  const buildingChangeRequestEvent =
    req.body as NewBuildingChangeRequestWebhookEvent;
  console.log(
    "Received new building change request event:",
    buildingChangeRequestEvent
  );

  // send email to support
  const { data: _, error } = await resend.emails.send({
    from: "Village <noreply@support.villageapp.nyc>",
    to: ["magiusdarrigo@gmail.com"],
    subject: "Building Change Request",
    html: `
        <h1>New Building Chage Request</h1>
        <p>User ID: ${buildingChangeRequestEvent.record.user_id}</p>
        <p>New Address Request: ${buildingChangeRequestEvent.record.address_request}</p>
        `,
  });

  if (error) {
    return res.status(500).send("Failed to send email to support");
  }

  return res.status(200);
});

// new reported post. Send a email to support
app.post("/newreportedpost", async (req: Request, res: Response) => {
  const reportedPostEvent = req.body as NewReportedPostWebhookEvent;
  console.log("Received new reported post event:", reportedPostEvent);

  // send email to support
  const { data: _, error } = await resend.emails.send({
    from: "Support <noreply@support.villageapp.nyc>",
    to: ["magiusdarrigo@gmail.com"],
    subject: "New Reported Post",
    html: `
        <h1>New Reported Post</h1>
        <p>Reported by User ID: ${reportedPostEvent.record.user_id_reporting}</p>
        <p>Reason: ${reportedPostEvent.record.reason}</p>
        <p>Post ID: ${reportedPostEvent.record.post_id}</p>
        `,
  });

  if (error) {
    return res.status(500).send("Failed to send email to support");
  }
  return res.status(200);
});

// new reported comment. Send a email to support
app.post("/newreportedcomment", async (req: Request, res: Response) => {
  const reportedCommentEvent = req.body as NewReportedCommentWebhookEvent;
  console.log("Received new reported comment event:", reportedCommentEvent);

  // send email to support
  const { data: _, error } = await resend.emails.send({
    from: "Support <noreply@support.villageapp.nyc>",
    to: ["magiusdarrigo@gmail.com"],
    subject: "New Reported Comment",
    html: `
        <h1>New Reported Comment</h1>
        <p>Reported by User ID: ${reportedCommentEvent.record.user_id_reporting}</p>
        <p>Reason: ${reportedCommentEvent.record.reason}</p>
        <p>Post ID: ${reportedCommentEvent.record.comment_id}</p>
        `,
  });

  if (error) {
    return res.status(500).send("Failed to send email to support");
  }
  return res.status(200);
});

async function init() {
  try {
    await connectRabbitMQ();
    console.log("Connected to RabbitMQ... Ready for publishing.");
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
