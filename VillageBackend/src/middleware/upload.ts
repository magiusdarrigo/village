import multer from "multer";

const FIFTY_MB_IN_BYTES = 52428800;

export const upload = multer({
  dest: "uploads/",
  limits: { fileSize: FIFTY_MB_IN_BYTES },
});
