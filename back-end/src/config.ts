import mongoose from "mongoose";
import {UserRepository} from "./repository/user.repository";
import {UserService} from "./services/user.service";
import {PostRepository} from "./repository/post.repository";
import {FollowRepository} from "./repository/follow.repository";

export const followRepository = new FollowRepository(mongoose);
export const postRepository = new PostRepository(mongoose);
export const userRepository = new UserRepository(mongoose);
export const userService = new UserService(userRepository, postRepository, followRepository);


export const jwtSecret = process.env.JWT_SECRET||"FDaI22";