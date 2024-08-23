import mongoose from "mongoose";
import {TagRepository} from "./repository/tag.repository"
import {PostService} from "./services/post.service"
import {UserRepository} from "./repository/user.repository";
import {TokenRepository} from "./repository/token.repository";
import {UserService} from "./services/user.service";
import { TokenService } from "./services/reset.service";
import { EmailService } from "./utilities/nodemailer";
import {PostRepository} from "./repository/post.repository";
import { FollowRepository } from "./repository/follow.repository";
import { LikesRepository } from "./repository/likes.repository";
import { CommentslikeRepository } from "./repository/commentslike.repository";
import { CommentsRepository } from "./repository/comments.repository";
import { BookmarksRepository } from "./repository/bookmarks.repository";

export const followRepository = new FollowRepository(mongoose);
export const tagRepository = new TagRepository(mongoose);
export const postRepository = new PostRepository(mongoose);
export const likesRepository = new LikesRepository(mongoose);
export const commentslikeRepository = new CommentslikeRepository(mongoose);
export const commentsRepository = new CommentsRepository(mongoose);
export const bookmarksRepository = new BookmarksRepository(mongoose);
export const userRepository = new UserRepository(mongoose);
export const bookmarkRepository = new BookmarksRepository(mongoose);
export const postService = new PostService(postRepository, tagRepository, commentsRepository, bookmarksRepository, likesRepository, commentslikeRepository, bookmarkRepository);
export const tokenRepository = new TokenRepository(mongoose);
export const emailService = new EmailService();

export const userService = new UserService(userRepository, postRepository, tokenRepository, followRepository);
export const tokenService = new TokenService(tokenRepository,userRepository,userService, emailService);

export const jwtSecret = process.env.JWT_SECRET||"FDaI22";