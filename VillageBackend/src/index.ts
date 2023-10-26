import express from "express";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import neighborhoodRoutes from "./routes/neighborhoodRoutes";
import buildingRoutes from "./routes/buildingRoutes";
import commentRoutes from "./routes/commentRoutes";
import chatMessageRoutes from "./routes/chatMessageRoutes";

const app = express();
app.use(express.json());
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/neighborhoods", neighborhoodRoutes);
app.use("/buildings", buildingRoutes);
app.use("/comments", commentRoutes);
app.use("/chatMessages", chatMessageRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("server ready at localhost:3000");
});
