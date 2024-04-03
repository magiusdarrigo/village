import express, { Request, Response } from "express";

const app = express();
const port = 3002;

app.use(express.json());

app.post("/newpost", (req: Request, res: Response) => {
  console.log("Received new post event:", req.body);
  res.status(200).send("Post event received");
});

app.listen(port, () => {
  console.log(`VillageEventPublisher listening at http://localhost:${port}`);
});
