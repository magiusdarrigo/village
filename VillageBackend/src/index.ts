import express from "express";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";

const app = express();
app.use(express.json());
app.use("/user", userRoutes);
app.use("/post", postRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("server ready at localhost:3000");
});
