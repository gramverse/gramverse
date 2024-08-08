import mongoose from "mongoose";
import {UserRepository} from "./repository/user.repository";
import {UserService} from "./services/user.service";
import dotenv from 'dotenv';

export const userRepository = new UserRepository(mongoose);
export const userService = new UserService(userRepository);


dotenv.config();

export const config = {
    jwtSecret: process.env.JWT_SECRET || 'default-secret'
};
