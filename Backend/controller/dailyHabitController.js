import dailyHabit from '../model/dailyHabitModel.js';
import User from '../model/usermodel.js';
import { BADGE_MILESTONES, getEarnedBadges } from '../config/badges.js';
import { logger } from '../utils/logger.js';

const STREAK_TIMEZONE = process.env.STREAK_TIMEZONE || 'UTC';

const getDateInTimeZone = (date, timeZone) => {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    } catch {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'UTC',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    }
};

const isValidISODateOnly = (value) => {
    if (typeof value !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const isoDateOnlyToUtcMidnightMs = (isoDateOnly) => {
    if (!isValidISODateOnly(isoDateOnly)) return null;
    const [yearStr, monthStr, dayStr] = isoDateOnly.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    return Date.UTC(year, month - 1, day);
};

export const createDailyHabit=async(req,res)=>{
    try {
        const {habitName,description,color,icon}=req.body || {};
        if (!habitName || typeof habitName !== 'string' || !habitName.trim()) {
            return res.status(400).json({
                success:false,
                message:"habitName is required"
            });
        }

        const saved = await dailyHabit.create({
            habitName: habitName.trim(),
            description,
            color:color || "purple",
            icon:icon || "star",
            owner:req.user.id
        });
        res.status(201).json({
            success:true,
            data:saved
        });
    }
    catch (error) {
        logger.warn('createDailyHabit failed', { message: error?.message, userId: req.user?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};
export const getDailyHabits=async(req,res)=>{
    try{
        const habits=await dailyHabit.find({owner:req.user.id});
        res.json({success:true,data:habits});
    } catch (error) {
        logger.warn('getDailyHabits failed', { message: error?.message, userId: req.user?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

export const getDailyHabitById=async(req,res)=>{
    try {
        const habit=await dailyHabit.findOne({_id:req.params.id,owner:req.user.id});
        if(!habit){
            return res.status(404).json({
                success:false,
                message:"Daily Habit not found"
            });
        }
        res.json({success:true,data:habit});
    } catch (error) {
        logger.warn('getDailyHabitById failed', { message: error?.message, userId: req.user?.id, habitId: req.params?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

export const updateDailyHabitById=async(req,res)=>{
    try {
        const {habitName,description,color,icon,completions}=req.body;
        const habit=await dailyHabit.findOne({_id:req.params.id,owner:req.user.id});
        if(!habit){
            return res.status(404).json({
                success:false,
                message:"Daily Habit not found"
            });
        }

        if (habitName !== undefined && (typeof habitName !== 'string' || !habitName.trim())) {
            return res.status(400).json({
                success:false,
                message:"habitName cannot be empty"
            });
        }

        if (completions !== undefined && !Array.isArray(completions)) {
            return res.status(400).json({
                success:false,
                message:"completions must be an array of dates"
            });
        }

        const updatedHabit = await dailyHabit.updateHabit(req.params.id, {
            habitName: habitName !== undefined ? habitName.trim() : habit.habitName,
            description: description || habit.description,
            color: color || habit.color,
            icon: icon || habit.icon,
            completions: completions
        });
        res.json({success:true,data:updatedHabit});
    } catch (error) {
        logger.warn('updateDailyHabitById failed', { message: error?.message, userId: req.user?.id, habitId: req.params?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};
export const deleteDailyHabitById=async(req,res)=>{
    try {
        const habit=await dailyHabit.findOneAndDelete({_id:req.params.id,owner:req.user.id});
        if(!habit){
            return res.status(404).json({
                success:false,
                message:"Daily Habit not found"
            });
        }
        res.json({success:true,message:"Daily Habit deleted successfully"});
    } catch (error) {
        logger.warn('deleteDailyHabitById failed', { message: error?.message, userId: req.user?.id, habitId: req.params?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

const isBeforeEOD = (today, timeZone) => {
    // Guard against edge cases where a request crosses midnight in the configured timezone.
    // If "today" is derived from the current request time in the same timezone, this will be true.
    return getDateInTimeZone(new Date(), timeZone) === today;
};

const checkAndUpdateStreak = async (userId, today) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return null;
        }

        const habits = await dailyHabit.find({ owner: userId });

        if (habits.length === 0) {
            return null;
        }

        const allCompleted = habits.every(habit => Array.isArray(habit.completions) && habit.completions.includes(today));

        if (!allCompleted || habits.length === 0) {
            return { streakUpdated: false, newStreak: user.streak || 0, badgesEarned: [] };
        }

        if (user.last_streak_date === today) {
            return { streakUpdated: false, newStreak: user.streak || 0, badgesEarned: [] };
        }

        if (!isBeforeEOD(today, STREAK_TIMEZONE)) {
            return { streakUpdated: false, newStreak: user.streak || 0, badgesEarned: [] };
        }

        let newStreak = 1;
        const currentStreak = user.streak || 0;
        if (user.last_streak_date) {
            const lastMs = isoDateOnlyToUtcMidnightMs(user.last_streak_date);
            const todayMs = isoDateOnlyToUtcMidnightMs(today);

            if (lastMs === null || todayMs === null) {
                newStreak = 1;
            } else {
                const diffDays = Math.round((todayMs - lastMs) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    newStreak = currentStreak + 1;
                } else if (diffDays > 1) {
                    newStreak = 1;
                } else if (diffDays === 0) {
                    return { streakUpdated: false, newStreak: currentStreak, badgesEarned: [] };
                } else {
                    // Clock skew / future dates: don't update.
                    return { streakUpdated: false, newStreak: currentStreak, badgesEarned: [] };
                }
            }
        } else {
            newStreak = 1;
        }

        await User.updateStreak(userId, newStreak, today);

        const earnedBadges = getEarnedBadges(newStreak);
        const userWithBadges = await User.findByIdWithBadges(userId);
        const existingBadgeNames = (userWithBadges.badges || []).map(b => b.name);
        const newBadges = [];

        for (const badge of earnedBadges) {
            if (!existingBadgeNames.includes(badge.name)) {
                await User.addBadge(userId, {
                    name: badge.name,
                    streakRequired: badge.streakRequired,
                });
                newBadges.push(badge);
            }
        }

        return {
            streakUpdated: true,
            newStreak: newStreak,
            badgesEarned: newBadges,
        };
    } catch (error) {
        logger.error('checkAndUpdateStreak failed', { message: error?.message, userId, today });
        return null;
    }
};

export const toggleCompletion=async(req,res)=>{
    try {
        const { date: requestedDate } = req.body || {};
        if (requestedDate !== undefined && !isValidISODateOnly(requestedDate)) {
            return res.status(400).json({
                success:false,
                message:"date must be in YYYY-MM-DD format"
            });
        }
        
        const habit=await dailyHabit.findOne({_id:req.params.id,owner:req.user.id});
        if(!habit){
            return res.status(404).json({
                success:false,
                message:"Daily Habit not found"
            });
        }

        if (!Array.isArray(habit.completions)) {
            habit.completions = [];
        }
        
        // Always use the server-calculated "today" in the configured timezone.
        // This avoids client timezone/UTC drift causing streaks to never increment.
        const today = getDateInTimeZone(new Date(), STREAK_TIMEZONE);
        const effectiveDate = today;

        if (requestedDate && requestedDate !== effectiveDate) {
            logger.info('toggleCompletion received non-today date; normalizing to streak timezone date', {
                userId: req.user?.id,
                habitId: req.params?.id,
                requestedDate,
                effectiveDate,
                timeZone: STREAK_TIMEZONE,
            });
        }

        const dateIndex=habit.completions.indexOf(effectiveDate);
        let wasCompleted = false;
        if(dateIndex>-1){
            habit.completions.splice(dateIndex,1);
            wasCompleted = false;
        }
        else{
            habit.completions.push(effectiveDate);
            wasCompleted = true;
        }
        
        const updatedHabit=await dailyHabit.updateHabit(req.params.id, { completions: habit.completions });
        
        let streakResult = null;
        if (wasCompleted) {
            await new Promise(resolve => setTimeout(resolve, 50));
            streakResult = await checkAndUpdateStreak(req.user.id, effectiveDate);
        }
        
        res.json({
            success:true,
            data:updatedHabit,
            streak: streakResult
        });
    } catch (error) {
        logger.error('toggleCompletion failed', { message: error?.message, userId: req.user?.id, habitId: req.params?.id });
        res.status(500).json({
            success:false,
            message:"Error toggling completion: " + error.message
        });
    }
};

export const getHabitProgress=async(req,res)=>{
    try{
        const today = getDateInTimeZone(new Date(), STREAK_TIMEZONE);
        const habits=await dailyHabit.find({owner:req.user.id});
        const totalHabits=habits.length;
        const completedToday=habits.filter(h=>Array.isArray(h.completions) && h.completions.includes(today)).length;
        const percentage=totalHabits>0?Math.round((completedToday/totalHabits)*100):0;

        const user = await User.findById(req.user.id);
        
        res.json({
            success:true,
            data:{
                total:totalHabits,
                completed:completedToday,
                percentage:percentage,
                date:today,
                streak: user?.streak || 0,
                allCompleted: totalHabits > 0 && completedToday === totalHabits
            }
        });
    }catch(error){
        logger.warn('getHabitProgress failed', { message: error?.message, userId: req.user?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

