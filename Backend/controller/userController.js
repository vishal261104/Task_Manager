import User from '../model/usermodel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET=process.env.JWT_SECRET || "your_jwt_secret_here";
const TOKEN_EXPIRES='24h';
const createToken=(userId)=>{
    return jwt.sign({id:userId},JWT_SECRET,{expiresIn:TOKEN_EXPIRES});
}
export async function registerUser(req,res){
    const{name,email,password}=req.body;
    if(!name || !email ||!password){
        return res.status(400).json({success:false,message:"Please fill all the details"});
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({success:false,message:"Please enter a valid email"});
    }
    if(!validator.isStrongPassword(password)){
        return res.status(400).json({success:false,message:"Please enter a strong password"});
    }
    if(password.length<8){
        return res.status(400).json({success:false,message:"Password must be at least 8 characters"});
    }
    try{
        if(await User.findOne({email})){
            return res.status(409).json({success:false,message:"User already exists"});
        }
        const hashed=await bcrypt.hash(password,10);
        const user=await User.create({name,email,password:hashed});
        const token=createToken(user._id);
        return res.status(201).json({success:true,message:"User registered successfully",token,user:{name:user.name,email:user.email,id:user._id}});
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}



export async function loginUser(req,res){
    const{email,password}=req.body;
    if(!email ||!password){
        return res.status(400).json({success:false,message:"Please fill all the details"});
    }
    try{
        const user =await User.findOne({email});
        if(!user){
            return res.status(401).json({success:false,message:"Invalid email or password"});
        }
        const match=await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({success:false,message:"Invalid email or password"});
        }
        const token=createToken(user._id);
        return res.status(200).json({success:true,message:"User logged in successfully",token,user:{name:user.name,email:user.email,id:user._id}});
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}

export async function getCurrentUser(req, res) {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function updateUser(req, res) {
    const {name,email}=req.body;
    if(!name || !email||!validator.isEmail(email)){
        return res.status(400).json({success:false,message:"valid name and email needed"});
    }
    try{
        const exists=await User.findOne({email,_id:{$ne:req.user.id}});
        if(exists){
            return res.status(409).json({success:false,message:"Email already in use"});
        }
        const user=await User.findByIdAndUpdate(req.user.id,{name,email},{new:true,runValidators:true}).select('name email');
        res.json({success:true,user});

    }
    catch(error){
        console.log(error);
        res.status(500).json({success:false,message:"server error"});

    }
    
}
export async function updatePassword(req,res){
    const {currentPassword,newPassword}=req.body;
    if(!currentPassword||!newPassword||newPassword.length<8){
        return res.json(400).json({success:false,message:"password invalid or too short"});
    }
    try{
        const user=await User.findById(req.user.id).select("password");
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
            
        }
        const match=await bcrypt.compare(currentPassword,user.password);
        if(!match){
            return res.status(401).json({success:false,message:"Current password is incorrect"});
        }
        const hashed=await bcrypt.hash(newPassword,10);
        await User.findByIdAndUpdate(req.user.id,{password:hashed});
        return res.status(200).json({success:true,message:"Password updated successfully"});
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}