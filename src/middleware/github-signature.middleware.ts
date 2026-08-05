import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function verifyGithubSignature(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const githubSignature = req.header("X-Hub-Signature-256");
  if (!githubSignature) {
    return res.status(401).json({
      message: "Missing GitHub signature",
    });
  }
  const generatedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!)
      .update(req.rawBody!)
      .digest("hex");

  const githubBuffer = Buffer.from(githubSignature);
  const serverBuffer = Buffer.from(generatedSignature);

  if (githubBuffer.length !== serverBuffer.length) {
    return res.status(401).json({
      message: "Invalid GitHub signature",
    });
  }

  const isValid = crypto.timingSafeEqual(
    githubBuffer, serverBuffer
  );

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid GitHub signature",
    });
  }

  next();
}
