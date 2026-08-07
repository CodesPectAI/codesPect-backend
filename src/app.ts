import express from "express";
import healthRouter from "./modules/health/health.routes";
import githubAppRouter from "./modules/github-app/routes/github-app.routes";
import { config } from "dotenv";
config();

const app = express();
app.use(
  express.json({
    verify(req, res, buf) {
      req.rawBody = Buffer.from(buf);
    },
  }),
);
app.use(healthRouter);
app.use("/github", githubAppRouter);

export default app;
