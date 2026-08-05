import {Router} from "express"
import { handleWebhook } from "./github-app.controllers";
import { verifyGithubSignature } from "../../middleware/github-signature.middleware";

const router = Router();

router.post('/webhooks',verifyGithubSignature, handleWebhook);

export default router;