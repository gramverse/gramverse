import mongoose from "mongoose";
import {TagRepository} from "./repository/tag.repository"
import {PostService} from "./services/post.service"
import {UserRepository} from "./repository/user.repository";
import {TokenRepository} from "./repository/token.repository";
import {UserService} from "./services/user.service";
import { TokenService } from "./services/token.service";
import { EmailService } from "./utilities/nodemailer";
import {PostRepository} from "./repository/post.repository";
import { FollowRepository } from "./repository/follow.repository";

export const followRepository = new FollowRepository(mongoose);
export const tagRepository = new TagRepository(mongoose);
export const postRepository = new PostRepository(mongoose);
export const postService = new PostService(postRepository, tagRepository);
export const userRepository = new UserRepository(mongoose);
export const tokenRepository = new TokenRepository(mongoose);
export const emailService = new EmailService();

export const userService = new UserService(userRepository, postRepository, tokenRepository, followRepository);
export const tokenService = new TokenService(tokenRepository,userRepository,emailService);

export const jwtSecret = process.env.JWT_SECRET||"FDaI22";