import jwt from 'jsonwebtoken';
import User from '../model/usermodel.js';
import { logger } from '../utils/logger.js';
const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req,res,next){
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        logger.warn('Unauthorized request (missing bearer token)', { path: req.originalUrl, method: req.method });
        return res.status(401).json({success:false,message:"Unauthorized"});
    }
    const token=authHeader.split(' ')[1];
    try{
        const payload=jwt.verify(token,JWT_SECRET);
        const user=await User.findById(payload.id);
        if(!user){
            logger.warn('Unauthorized request (user not found)', { path: req.originalUrl, method: req.method });
            return res.status(401).json({success:false,message:"Unauthorized"});
        }
        delete user.password;
        req.user={id: user.id, ...user};
        next();
    }catch(error){
        logger.warn('Unauthorized request (invalid token)', { path: req.originalUrl, method: req.method });
        return res.status(401).json({success:false,message:"Unauthorized"});
    }
}
export {authMiddleware};