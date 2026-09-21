import express from "express";
import multer from "multer";
import {
  createComponent,
  getAllComponents,
  getComponentImageById,
  uploadComponentImage,
  updateComponent,
  deleteComponent,
  searchComponents,
  importZip
} from "../controllers/componentController.js";
import { isAdministrador, verifyToken } from "../middlewares/authJwt.js";
import uploadImage from "../middlewares/uploadImage.js";

const router = express.Router();
const uploadZip = multer({ storage: multer.memoryStorage() });

// GET /api/component/search?q=termino
router.get(
  "/search", 
  verifyToken, 
  searchComponents
);

// GET /api/component/all
router.get("/all", getAllComponents); 

// GET /api/component/:id/image
router.get("/:id/image", getComponentImageById);

// POST /api/component/import-zip
router.post(
  "/import-zip",
  verifyToken,
  isAdministrador,
  uploadZip.single("archivoZip"), // Debe coincidir con el nombre del campo en el frontend
  importZip
);

// POST /api/component/upload-image
router.post(
  "/upload-image",
  verifyToken,
  isAdministrador,
  uploadImage.single("imagen"),
  uploadComponentImage
);

// POST /api/component/add
router.post(
  "/add",
  verifyToken,
  isAdministrador,
  uploadImage.single("imagen"),
  createComponent
);

// PATCH /api/component/update/:id 
router.patch(
  "/update/:id",
  verifyToken,
  isAdministrador,
  uploadImage.single("imagen"),
  updateComponent
);

// DELETE /api/component/:id
router.delete(
  "/:id",
  verifyToken,
  isAdministrador,
  deleteComponent
);

export default router;