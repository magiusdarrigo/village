import { Router } from "express";

const router = Router();

// create tweet
router.post("/", (req, res) => {
  res.status(501).json({ error: "post tweet not implemented" });
});

// list tweet
router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `get tweet ${id} not implemented` });
});

// update tweet
router.put("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `put tweet ${id} not implemented` });
});

// delete tweet
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `delete tweet ${id} not implemented` });
});

export default router;
