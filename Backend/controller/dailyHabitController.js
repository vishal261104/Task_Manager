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
    // "Before end of day" means: we are still in the same calendar day
    // in the configured streak timezone.
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
            const lastDate = new Date(user.last_streak_date + 'T00:00:00');
            const todayDate = new Date(today + 'T00:00:00');
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak = currentStreak + 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            } else if (diffDays === 0) {
                return { streakUpdated: false, newStreak: currentStreak, badgesEarned: [] };
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
        const {date}=req.body;

        if (!date || !isValidISODateOnly(date)) {
            return res.status(400).json({
                success:false,
                message:"date is required in YYYY-MM-DD format"
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
        
        const dateIndex=habit.completions.indexOf(date);
        let wasCompleted = false;
        if(dateIndex>-1){
            habit.completions.splice(dateIndex,1);
            wasCompleted = false;
        }
        else{
            habit.completions.push(date);
            wasCompleted = true;
        }
        
        const updatedHabit=await dailyHabit.updateHabit(req.params.id, { completions: habit.completions });
        
        const today = getDateInTimeZone(new Date(), STREAK_TIMEZONE);
        let streakResult = null;
        if (wasCompleted && date === today) {
            await new Promise(resolve => setTimeout(resolve, 100));
            streakResult = await checkAndUpdateStreak(req.user.id, today);
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

