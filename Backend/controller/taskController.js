 import Task  from "../model/taskModel.js";


 export const createTask=async(req,res)=>{
    try {
        const {title,description,priority,dueDate,completed}=req.body;
        const newTask=new Task({
            title,
            description,
            priority,
            dueDate,
            completed:completed=="Yes"||completed===true?true:false,
            owner:req.user._id
        });
        const saved =await newTask.save();
        res.status(201).json({
            success:true,
            data:saved
        });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};
export const getTasks=async(req,res)=>{
    try{
        const tasks=await Task.find({owner:req.user._id}).sort({createdAt:-1});
        res.json({success:true,data:tasks});
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};

export const getTaskById=async(req,res)=>{
    try {
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id});
        if(!task){
            return res.status(404).json({
                success:false,
                message:"Task not found"
            });
        }
        res.json({success:true,data:task});
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};

export const updateTaskById=async(req,res)=>{
     try{
        const data={...req.body,updatedAt:Date.now()};
        if(data.completed!==undefined){
            data.completed=data.completed=="Yes"||data.completed===true?true:false;
        }
        const updatedTask=await Task.findOneAndUpdate({_id:req.params.id,owner:req.user._id},data,{new:true});
        if(!updatedTask){
            return res.status(404).json({
                success:false,
                message:"Task not found or Its Not Yours"
            });
        }
        res.json({success:true,data:updatedTask});
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};
export const deleteTask=async(req,res)=>{
    try{
       const deleted=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
       if(!deleted){
        return res.status(404).json({
            success:false,
            message:"Task not found or Its Not Yours"
        });
       }
       res.json({success:true,message:"Task Deleted Successfully"});
    }
    catch(error){
        console.error("Error deleting task:", error);
        res.status(400).json({
            success:false,
            message:"Bad Request"
        });
    }
};
