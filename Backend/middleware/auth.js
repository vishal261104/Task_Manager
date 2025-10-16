import jwt from 'jsonwebtoken';
import User from '../model/usermodel.js';
const JWT_SECRET=process.env.JWT_SECRET || "your_jwt_secret_here";

export default async function authMiddleware(req,res,next){
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({success:false,message:"Unauthorized"});
    }
    const token=authHeader.split(' ')[1];
    try{
        const payload=jwt.verify(token,JWT_SECRET);
        const user=await User.findById(payload.id).select('-password');
        req.user=user;
        if(!user){
            return res.status(401).json({success:false,message:"Unauthorized"});
        }
        next();
    }catch(error){
        console.log(error);
        return res.status(401).json({success:false,message:"Unauthorized"});
    }
}
export {authMiddleware};