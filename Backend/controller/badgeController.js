import User from '../model/usermodel.js';
import { BADGE_MILESTONES, getNextBadge } from '../config/badges.js';
import { logger } from '../utils/logger.js';

export const getUserBadges = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            logger.warn('getUserBadges unauthorized (no user in request)');
            return res.status(401).json({
                success: false,
                message: "Unauthorized - no user"
            });
        }
        
        const user = await User.findByIdWithBadges(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const enrichedBadges = (user.badges || []).map(badge => {
            const milestone = BADGE_MILESTONES.find(m => m.name === badge.name);
            return {
                name: badge.name,
                earnedAt: badge.earned_at || badge.earnedAt,
                streakRequired: badge.streak_required ?? badge.streakRequired,
                // Back-compat fields (older UI may still read snake_case)
                earned_at: badge.earned_at || badge.earnedAt,
                streak_required: badge.streak_required ?? badge.streakRequired,
                icon: milestone?.icon || '🏅',
                description: milestone?.description || '',
            };
        });

        enrichedBadges.sort((a, b) => new Date(b.earnedAt || b.earned_at) - new Date(a.earnedAt || a.earned_at));

        res.json({
            success: true,
            data: {
                badges: enrichedBadges,
                streak: user.streak,
                nextBadge: getNextBadge(user.streak),
            }
        });
    } catch (error) {
        logger.error('getUserBadges failed', { message: error?.message, userId: req.user?.id });
        res.status(500).json({
            success: false,
            message: "Error fetching badges: " + error.message
        });
    }
};

export const getBadgeMapping = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            logger.warn('getBadgeMapping unauthorized (no user in request)');
            return res.status(401).json({
                success: false,
                message: "Unauthorized - no user"
            });
        }
        
        const user = await User.findByIdWithBadges(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const earnedBadgeNames = (user.badges || []).map(b => b.name);

        const badgeMapping = BADGE_MILESTONES.map(badge => ({
            ...badge,
            earned: earnedBadgeNames.includes(badge.name),
            progress: user.streak >= badge.streakRequired ? 100 : Math.min(100, (user.streak / badge.streakRequired) * 100),
        }));

        res.json({
            success: true,
            data: {
                badges: badgeMapping,
                currentStreak: user.streak,
            }
        });
    } catch (error) {
        logger.error('getBadgeMapping failed', { message: error?.message, userId: req.user?.id });
        res.status(500).json({
            success: false,
            message: "Error fetching badge mapping: " + error.message
        });
    }
};
