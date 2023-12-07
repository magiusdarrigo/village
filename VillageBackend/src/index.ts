import express from "express";
import v1AuthUserRoutes from "./controllers/authenticated_user_routes/v1";
import v1UnAuthUserRoutes from "./controllers/unauth_user_routes/v1";
import v1AdminRoutes from "./controllers/admin_routes/v1";
import {
  authenticateUserToken,
  authenticateAdminToken,
} from "./middleware/auth";
import redisClient from "./clients/redisClient";

const app = express();
app.use(express.json());

async function main() {
  try {
    await redisClient.connect();
    // routes that don't require authentication first.
    app.use("/v1", v1UnAuthUserRoutes);

    // routes that require admin authentication
    app.use("/v1/admin", authenticateAdminToken, v1AdminRoutes);

    // routes that require user authentication
    app.use("/v1", authenticateUserToken, v1AuthUserRoutes);

    app.listen(3000, () => {
      console.log("server ready at localhost:3000");
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
main();
