import getHealth from "./health.controllers";
import { Router } from "express";

const router = Router();

router.get("/", getHealth);

export default router;  