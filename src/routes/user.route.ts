import { Router } from 'express';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repository/user.repository';
import mongoose from 'mongoose';

const userRepository = new UserRepository(mongoose);
const userService = new UserService(userRepository);

export const userRouter = Router();

userRouter.post('/signup', async (req, res, next) => {
    const { userName, email, password } = req.body;
    
    try {
        const { user, token } = await userService.signUp(userName, email, password);
        res.header('Authorization', `Bearer ${token}`).status(201).json({ user });
    } catch (error) {
        next(error);
    }
});
