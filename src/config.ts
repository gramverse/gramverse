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
import { CommentRepository } from "./repository/comment.repository";
import { BookmarksRepository } from "./repository/bookmarks.repository";
import { BlockRepository } from "./repository/block.repository";
import {NotificationRepository} from "./repository/notification.repository";
import {EventRepository} from "./repository/event.repository";
import {NotificationService} from "./services/notification.service";
import { EventService } from "./services/event.service";
import { FollowService } from "./services/follow.service";
import dotenv from "dotenv";

dotenv.config();

const followRepository = new FollowRepository(mongoose);
const tagRepository = new TagRepository(mongoose);
const postRepository = new PostRepository(mongoose);
const likesRepository = new LikesRepository(mongoose);
const commentslikeRepository = new CommentslikeRepository(mongoose);
const commentRepository = new CommentRepository(mongoose);
const bookmarksRepository = new BookmarksRepository(mongoose);
const userRepository = new UserRepository(mongoose);
const bookmarkRepository = new BookmarksRepository(mongoose);
const tokenRepository = new TokenRepository(mongoose);
const emailService = new EmailService();
const blockRepository = new BlockRepository(mongoose);
const notificationRepository = new NotificationRepository(mongoose);
const eventRepository = new EventRepository(mongoose);

export const eventService = new EventService(eventRepository);
export const notificationService = new NotificationService(eventService, notificationRepository, postRepository, commentRepository, followRepository, userRepository);
export const followService = new FollowService(notificationService, followRepository, userRepository, blockRepository)
export const postService = new PostService(followService, postRepository, userRepository, tagRepository, commentRepository, bookmarksRepository, likesRepository, commentslikeRepository, bookmarkRepository, followRepository,notificationService);
export const userService = new UserService(postService, userRepository, postRepository, tokenRepository, followRepository,notificationService);
export const tokenService = new TokenService(tokenRepository,userRepository,userService, emailService);

export const jwtSecret = process.env.JWT_SECRET||"FDaI22";