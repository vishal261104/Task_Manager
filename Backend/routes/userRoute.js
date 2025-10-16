import express from 'express';

const userRouter=express.Router();
import { registerUser, loginUser, getCurrentUser, updateUser, updatePassword } from '../controller/userController.js';
import { authMiddleware } from '../middleware/auth.js';

//Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

//Protected routes
userRouter.get('/profile', authMiddleware, getCurrentUser);
userRouter.put('/profile', authMiddleware, updateUser);
userRouter.put('/password', authMiddleware, updatePassword);

export default userRouter;
