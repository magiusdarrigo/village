import { Router } from "express";

const router = Router();

// create post
router.post("/", async (req, res) => {
  const { userID, neighborhoodID, textContent, imageURL } = req.body;
});

// // list post
// router.get("/:id", (req, res) => {
//   const { id } = req.params;
//   res.status(501).json({ error: `get tweet ${id} not implemented` });
// });

// // update post
// router.put("/:id", (req, res) => {
//   const { id } = req.params;
//   res.status(501).json({ error: `put tweet ${id} not implemented` });
// });

// // delete post
// router.delete("/:id", (req, res) => {
//   const { id } = req.params;
//   res.status(501).json({ error: `delete tweet ${id} not implemented` });
// });

export default router;
