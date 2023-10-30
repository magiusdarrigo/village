const express = require("express");

import postsRouter from "./postRoutes";
import usersRouter from "./userRoutes";
import neighborhoodsRouter from "./neighborhoodRoutes";
import buildingsRouter from "./buildingRoutes";
import commentsRouter from "./commentRoutes";
import chatMessagesRouter from "./chatMessageRoutes";

const router = express.Router();

router.use("/posts", postsRouter);
router.use("/users", usersRouter);
router.use("/neighborhoods", neighborhoodsRouter);
router.use("/buildings", buildingsRouter);
router.use("/comments", commentsRouter);
router.use("/chatMessages", chatMessagesRouter);

export default router;
