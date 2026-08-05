import { Request, Response } from "express";

export default function getHealth(req: Request, res: Response) {
    res.json({ message: "ok" });
}