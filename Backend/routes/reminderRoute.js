import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getRemindersNow, triggerEmailReminders } from "../controller/reminderController.js";

const reminderRouter = express.Router();

reminderRouter.get("/now", authMiddleware, getRemindersNow);
reminderRouter.post("/trigger", authMiddleware, triggerEmailReminders);

export default reminderRouter;
