import express from "express";
import authController from "./auth.controller.js";

const router = express.Router();

router.post("/registro", authController.registrar);
router.post("/login", authController.login);

export default router;