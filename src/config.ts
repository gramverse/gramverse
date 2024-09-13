import mongoose from "mongoose";
import {TagRepository} from "./repository/tag.repository";
import {PostService} from "./services/post.service";
import {UserRepository} from "./repository/user.repository";
import {TokenRepository} from "./repository/token.repository";
import {UserService} from "./services/user.service";
import {ResetService} from "./services/reset.service";
import {EmailService} from "./utilities/nodemailer";
import {PostRepository} from "./repository/post.repository";
import {FollowRepository} from "./repository/follow.repository";
import {CommentLikeRepository} from "./repository/commentlike.repository";
import {CommentRepository} from "./repository/comment.repository";
import {BookmarkRepository} from "./repository/bookmark.repository";
import {BlockRepository} from "./repository/block.repository";
import {NotificationRepository} from "./repository/notification.repository";
import {EventRepository} from "./repository/event.repository";
import {NotificationService} from "./services/notification.service";
import {EventService} from "./services/event.service";
import {FollowService} from "./services/follow.service";
import dotenv from "dotenv";
import {UserRepService} from "./services/user.rep.service";
import {FollowRepService} from "./services/follow.rep.service";
import {PostRepService} from "./services/post.rep.service";
import {CommentService} from "./services/comment.service";
import {CommentRepService} from "./services/comment.rep.service";
import {LikesRepository as LikeRepository} from "./repository/like.repository";
import {MentionsRepository} from "./repository/mentions.repository";
import {SearchService} from "./services/search.service"

dotenv.config();

const followRepository = new FollowRepository(mongoose);
const tagRepository = new TagRepository(mongoose);
const postRepository = new PostRepository(mongoose);
const commentslikeRepository = new CommentLikeRepository(mongoose);
const commentRepository = new CommentRepository(mongoose);
const likeRepository = new LikeRepository(mongoose);
const userRepository = new UserRepository(mongoose);
const bookmarkRepository = new BookmarkRepository(mongoose);
const tokenRepository = new TokenRepository(mongoose);
const emailService = new EmailService();
const blockRepository = new BlockRepository(mongoose);
const notificationRepository = new NotificationRepository(mongoose);
const eventRepository = new EventRepository(mongoose);
const mentionRepository = new MentionsRepository(mongoose);

export const userRepService = new UserRepService(userRepository);
export const followRepService = new FollowRepService(
    followRepository,
    userRepService,
);
export const commentRepService = new CommentRepService(
    commentRepository,
    commentslikeRepository,
);
export const postRepService = new PostRepService(
    userRepService,
    followRepService,
    postRepository,
);
export const eventService = new EventService(eventRepository);
export const notificationService = new NotificationService(
    notificationRepository,
    eventService,
    userRepService,
    followRepService,
    postRepService,
    commentRepService,
);
export const followService = new FollowService(
    followRepService,
    userRepService,
    notificationService,
    blockRepository,
);
export const commentService = new CommentService(
    commentRepService,
    postRepService,
    notificationService,
);
export const postService = new PostService(
    followRepService,
    postRepService,
    userRepService,
    notificationService,
    commentRepService,
    tagRepository,
    likeRepository,
    bookmarkRepository,
    mentionRepository,
);
export const userService = new UserService(
    postRepService,
    userRepService,
    followRepService,
    notificationService,
);
export const resetService = new ResetService(
    tokenRepository,
    userRepService,
    emailService,
);
export const searchService = new SearchService(
    tagRepository,
    userRepService
)

export const jwtSecret = process.env.JWT_SECRET || "33rr55";
