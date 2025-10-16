import mongoose from "mongoose";
const taskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        default:""
    },
    priority:{
        type:String,
        enum:["Low","Medium","High"],
        default:"Medium"
    },
    dueDate:{
        type:Date,
        default:null
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["Pending","In-Progress","Completed"],
        default:"Pending"
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

const Task=mongoose.model.Task||mongoose.model("Task",taskSchema);
export default Task;
