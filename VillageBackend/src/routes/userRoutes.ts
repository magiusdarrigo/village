import { Router } from "express";

const router = Router();

// create user
router.post("/", (req, res) => {
  res.status(501).json({ error: "post user not implemented" });
});

// list users
router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `get user ${id} not implemented` });
});

// update user
router.put("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `put user ${id} not implemented` });
});

// delete user
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `delete user ${id} not implemented` });
});

export default router;
