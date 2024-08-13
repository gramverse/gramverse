import mongoose from "mongoose";
import {UserRepository} from "./repository/user.repository";
import {UserService} from "./services/user.service";
import {PostRepository} from "./repository/post.repository";

export const userRepository = new UserRepository(mongoose);
export const userService = new UserService(userRepository);

export const postRepository = new PostRepository(mongoose);

export const jwtSecret = process.env.JWT_SECRET||"FDaI22";