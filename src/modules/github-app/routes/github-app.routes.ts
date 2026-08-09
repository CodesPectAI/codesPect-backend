import { Router } from "express";
import { handleWebhook } from "../controllers/github-app.controllers.js";
import { verifyGithubSignature } from "../../../middleware/github-signature.middleware.js";

const router = Router();

router.post("/webhooks", verifyGithubSignature, handleWebhook);

export default router;
