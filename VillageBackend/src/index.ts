import express from "express";
import v1AuthUserRoutes from "./controllers/authenticated_user_routes/v1";
import v1UnAuthUserRoutes from "./controllers/unauth_user_routes/v1";
import authenticateToken from "./middleware/auth";

const app = express();
app.use(express.json());

app.use("/v1", authenticateToken, v1AuthUserRoutes);
app.use("/v1", v1UnAuthUserRoutes);

app.listen(3000, () => {
  console.log("server ready at localhost:3000");
});
