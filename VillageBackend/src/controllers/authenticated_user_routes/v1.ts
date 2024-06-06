const express = require("express");

import postsRouter from "./postRoutes";
import usersRouter from "./userRoutes";
import neighborhoodsRouter from "./neighborhoodRoutes";
import buildingsRouter from "./buildingRoutes";
import commentsRouter from "./commentRoutes";
import chatMessagesRouter from "./chatMessageRoutes";
import accountDeletionRequestRouter from "./accountDeletionRequestRoutes";
import userFollowingRouter from "./userFollowingRoutes";
import contactsRouter from "./contactsRoutes";

const router = express.Router();

router.use("/posts", postsRouter);
router.use("/users", usersRouter);
router.use("/neighborhoods", neighborhoodsRouter);
router.use("/buildings", buildingsRouter);
router.use("/comments", commentsRouter);
router.use("/chatMessages", chatMessagesRouter);
router.use("/accountdeletionrequest", accountDeletionRequestRouter);
router.use("/userfollowing", userFollowingRouter);
router.use("/contacts", contactsRouter);

export default router;
