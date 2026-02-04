 import Task  from "../model/taskModel.js";
import { logger } from "../utils/logger.js";

const parsePositiveInt = (value) => {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
};

const isValidISODateOnly = (value) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const isPgClientError = (error) => {
    const code = error?.code;
    return (
        code === '22P02' || // invalid_text_representation
        code === '23502' || // not_null_violation
        code === '23503' || // foreign_key_violation
        code === '23505' || // unique_violation
        code === '23514'    // check_violation
    );
};


 export const createTask=async(req,res)=>{
    try {
        const {title,description,priority,dueDate,completed}=req.body || {};
        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                success:false,
                message:"Title is required"
            });
        }

        if (!isValidISODateOnly(dueDate)) {
            return res.status(400).json({
                success:false,
                message:"dueDate must be in YYYY-MM-DD format"
            });
        }

        const saved = await Task.create({
            title: title.trim(),
            description,
            priority,
            dueDate,
            completed:completed=="Yes"||completed===true?true:false,
            owner:req.user.id
        });
        res.status(201).json({
            success:true,
            data:saved
        });
    } catch (error) {
        logger.warn('createTask failed', { message: error?.message, userId: req.user?.id });
        const status = isPgClientError(error) ? 400 : 500;
        res.status(status).json({
            success:false,
            message: status === 400 ? "Bad Request" : "Internal server error"
        });
    }
};
export const getTasks=async(req,res)=>{
    try{
        const tasks=await Task.find({owner:req.user.id});
        res.json({success:true,data:tasks});
    } catch (error) {
        logger.warn('getTasks failed', { message: error?.message, userId: req.user?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

export const getTaskById=async(req,res)=>{    try {
        const taskId = parsePositiveInt(req.params.id);
        if (!taskId) {
            return res.status(400).json({
                success:false,
                message:"Invalid task id"
            });
        }

        const task=await Task.findOne({id:taskId,owner:req.user.id});
        if(!task){
            return res.status(404).json({
                success:false,
                message:"Task not found"
            });
        }
        res.json({success:true,data:task});
    } catch (error) {
        logger.warn('getTaskById failed', { message: error?.message, userId: req.user?.id, taskId: req.params?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

export const updateTaskById=async(req,res)=>{
     try{
        const taskId = parsePositiveInt(req.params.id);
        if (!taskId) {
            return res.status(400).json({
                success:false,
                message:"Invalid task id"
            });
        }

        const data={...req.body};
        if(data.completed!==undefined){
            data.completed=data.completed=="Yes"||data.completed===true?true:false;
        }

        if (data.title !== undefined && (typeof data.title !== 'string' || !data.title.trim())) {
            return res.status(400).json({
                success:false,
                message:"Title cannot be empty"
            });
        }

        if (!isValidISODateOnly(data.dueDate)) {
            return res.status(400).json({
                success:false,
                message:"dueDate must be in YYYY-MM-DD format"
            });
        }

        if (typeof data.title === 'string') {
            data.title = data.title.trim();
        }

        const updatedTask=await Task.findOneAndUpdate({id:taskId,owner:req.user.id},data,{new:true});
        if(!updatedTask){
            return res.status(404).json({
                success:false,
                message:"Task not found or Its Not Yours"
            });
        }
        res.json({success:true,data:updatedTask});
    } catch (error) {
        logger.warn('updateTaskById failed', { message: error?.message, userId: req.user?.id, taskId: req.params?.id });
        const status = isPgClientError(error) ? 400 : 500;
        res.status(status).json({
            success:false,
            message: status === 400 ? "Bad Request" : "Internal server error"
        });
    }
};
export const deleteTask=async(req,res)=>{
    try{
       const taskId = parsePositiveInt(req.params.id);
       if (!taskId) {
            return res.status(400).json({
                success:false,
                message:"Invalid task id"
            });
       }

       const deleted=await Task.findOneAndDelete({id:taskId,owner:req.user.id});
       if(!deleted){
        return res.status(404).json({
            success:false,
            message:"Task not found or Its Not Yours"
        });
       }
       res.json({success:true,message:"Task Deleted Successfully"});
    }
    catch(error){
        logger.warn('deleteTask failed', { message: error?.message, userId: req.user?.id, taskId: req.params?.id });
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};
