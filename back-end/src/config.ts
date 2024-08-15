import mongoose from "mongoose";
import {TagRepository} from "./repository/tag.repository"
import {PostService} from "./services/post.service"
import {UserRepository} from "./repository/user.repository";
import {UserService} from "./services/user.service";
import {PostRepository} from "./repository/post.repository";

export const tagRepository = new TagRepository(mongoose);
export const postRepository = new PostRepository(mongoose);
export const postService = new PostService(postRepository, tagRepository);
export const userRepository = new UserRepository(mongoose);
export const userService = new UserService(userRepository);





export const jwtSecret = process.env.JWT_SECRET||"FDaI22";