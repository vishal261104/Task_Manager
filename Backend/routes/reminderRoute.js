import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getRemindersNow } from "../controller/reminderController.js";

const reminderRouter = express.Router();

reminderRouter.get("/now", authMiddleware, getRemindersNow);

export default reminderRouter;
