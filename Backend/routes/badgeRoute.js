import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getUserBadges, getBadgeMapping } from '../controller/badgeController.js';

const badgeRouter = express.Router();

badgeRouter.get('/user', authMiddleware, getUserBadges);
badgeRouter.get('/mapping', authMiddleware, getBadgeMapping);

export default badgeRouter;
