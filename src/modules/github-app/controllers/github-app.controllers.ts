import { Request, Response, NextFunction } from "express";
import { handleGithubWebHook } from "../services/github-app.services.js";

export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const event = req.header("X-GitHub-Event");
    const payload = req.body;
    await handleGithubWebHook(event, payload);
    return res.status(200).json({
      message: "Github Webhook received",
    });
  } catch (error) {
    next(error);
  }
}
