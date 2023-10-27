import express from "express";
import v1Routes from "./controllers/v1";

const app = express();
app.use(express.json());

app.use("/v1", v1Routes);

app.listen(3000, () => {
  console.log("server ready at localhost:3000");
});
