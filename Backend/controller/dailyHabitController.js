import dailyHabit from '../model/dailyHabitModel.js';

export const createDailyHabit=async(req,res)=>{
    try {
        const {habitName,description,color,icon}=req.body;
        const newHabit=new dailyHabit({
            habitName,
            description,
            color:color || "purple",
            icon:icon || "star",
            owner:req.user._id
        });
        const saved =await newHabit.save();
        res.status(201).json({
            success:true,
            data:saved
        });
    }
    catch (error) {
        console.error("Error creating daily habit:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};
export const getDailyHabits=async(req,res)=>{
    try{
        const habits=await dailyHabit.find({owner:req.user._id}).sort({createdAt:-1});
        res.json({success:true,data:habits});
    } catch (error) {
        console.error("Error fetching daily habits:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};

export const getDailyHabitById=async(req,res)=>{
    try {
        const habit=await dailyHabit.findOne({_id:req.params.id,owner:req.user._id});
        if(!habit){
            return res.status(404).json({
                success:false,
                message:"Daily Habit not found"
            });
        }
        res.json({success:true,data:habit});
    } catch (error) {
        console.error("Error fetching daily habit:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};

export const updateDailyHabitById=async(req,res)=>{
    try {
        const {habitName,description,color,icon,completions}=req.body;
        const habit=await dailyHabit.findOne({_id:req.params.id,owner:req.user._id});
        if(!habit){
            return res.status(404).json({
                success:false,
                message:"Daily Habit not found"
            });
        }
        habit.habitName=habitName || habit.habitName;
        habit.description=description || habit.description;
        habit.color=color || habit.color;
        habit.icon=icon || habit.icon;
        if(completions){
            habit.completions=completions;
        }
        const updatedHabit=await habit.save();
        res.json({success:true,data:updatedHabit});
    } catch (error) {
        console.error("Error updating daily habit:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};
export const deleteDailyHabitById=async(req,res)=>{
    try {
        const habit=await dailyHabit.findOneAndDelete({_id:req.params.id,owner:req.user._id});
        if(!habit){
            return res.status(404).json({
                success:false,
                message:"Daily Habit not found"
            });
        }
        res.json({success:true,message:"Daily Habit deleted successfully"});
    } catch (error) {
        console.error("Error deleting daily habit:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};

export const toggleCompletion=async(req,res)=>{
    try {
        const {date}=req.body; // date in "YYYY-MM-DD" format
        const habit=await dailyHabit.findOne({_id:req.params.id,owner:req.user._id});
        if(!habit){
            return res.status(404).json({
                success:false,
                message:"Daily Habit not found"
            });
        }
        const dateIndex=habit.completions.indexOf(date);
        if(dateIndex>-1){
            // Date exists, remove it (mark as incomplete)
            habit.completions.splice(dateIndex,1);
        }
        else{
            // Date doesn't exist, add it (mark as complete)
            habit.completions.push(date);
        }
        const updatedHabit=await habit.save();
        res.json({success:true,data:updatedHabit});
    } catch (error) {
        console.error("Error toggling completion:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};

export const getHabitProgress=async(req,res)=>{
    try{
        const today = new Date().toISOString().split('T')[0];
        const habits=await dailyHabit.find({owner:req.user._id});
        const totalHabits=habits.length;
        const completedToday=habits.filter(h=>h.completions.includes(today)).length;
        const percentage=totalHabits>0?Math.round((completedToday/totalHabits)*100):0;
        
        res.json({
            success:true,
            data:{
                total:totalHabits,
                completed:completedToday,
                percentage:percentage,
                date:today
            }
        });
    }catch(error){
        console.error("Error getting progress:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};

