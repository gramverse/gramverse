import {NotificationRepository} from "../repository/notification.repository";
import {EventRepository} from "../repository/event.repository";
import {PostRepository} from "../repository/post.repository";
import {CommentsRepository} from "../repository/comments.repository";
import {FollowRepository} from "../repository/follow.repository";
import {UserRepository} from "../repository/user.repository";
import {Event} from "../models/notification/event";
import {Notification, BaseNotification, FollowNotification, CommentNotification, LikeNotification, MentionNotification} from "../models/notification/notification";
import { EventType } from "../models/notification/event-type";
import {getMockData} from "../utilities/mock";
import {HttpError} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import {FollowRequestState} from "../models/follow/follow-request-state";
import e from "express";

export class NotificationService {
    constructor(private notificationRepository: NotificationRepository, private eventRepository: EventRepository, private postRepository: PostRepository, private commentRepository: CommentsRepository, private followRepository: FollowRepository, private userRepository: UserRepository) {}

    getNotifications = async (userName: string, isMine: boolean, page: number, limit: number) => {
        const skip = (page-1) * limit;
        const notifications = await this.notificationRepository.getUserNotifications(userName, isMine, skip, limit);
        const totalCount = await this.notificationRepository.getNotifCount(userName, isMine);
        const dtos: BaseNotification[] = [];
        for (const notification of notifications) {
            const event = await this.eventRepository.getEventById(notification.eventId);
            if (!event) {
                throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Event not found");
            }
            let dto: BaseNotification|undefined = undefined;
            switch(event.type) {
                case EventType.LIKE:
                    dto = await this.getLikeDto(event, notification);
                    break;
                case EventType.COMMENT:
                    dto = await this.getCommentDto(event, notification);
                    break;
                case EventType.MENTION:
                    dto = await this.getMentionDto(event, notification);
                    break;
                case EventType.FOLLOW:
                    dto = await this.getFollowDto(event, notification);
                    break;
            }
            if (dto) {
                dtos.push(dto);
            }
        }
        return {notifications: dtos, totalCount: dtos.length};
    }

    getLikeDto = async (event: Event, notification: Notification) => {
        const {performerUserName, targetId: postId, type, creationDate} = event;
        const {seen, isMine} = notification;
        const post = await this.postRepository.getPostById(postId);
        if (!post) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
        }
        const postImage = post.photoUrls[0];
        const postCreator = post.userName;
        const dto: LikeNotification = {
            type,
            performerUserName,
            postId,
            postImage,
            postCreator,
            creationDate,
            isMine,
            seen,
        }
        return dto;
    }

    getCommentDto = async (event: Event, notification: Notification) => {
        const {performerUserName, targetId: commentId, type, creationDate} = event;
        const {seen, isMine} = notification;
        const commentObject = await this.commentRepository.getById(commentId);
        if (!commentObject) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
        }
        const {comment, postId} = commentObject;
        const post = await this.postRepository.getPostById(postId);
        if (!post) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
        }
        const postImage = post.photoUrls[0];
        const postCreator = post.userName;
        const dto: CommentNotification = {
            type,
            performerUserName,
            postId,
            postImage,
            postCreator,
            comment,
            creationDate,
            isMine,
            seen,
        }
        return dto;
    }

    getMentionDto = async (event: Event, notification: Notification) => {
        const {performerUserName, targetId: postId, type, creationDate} = event;
        const {seen, isMine} = notification;
        const post = await this.postRepository.getPostById(postId);
        if (!post) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
        }
        const postImage = post.photoUrls[0];
        const dto: MentionNotification = {
            type,
            performerUserName,
            postId,
            postImage,
            creationDate,
            isMine,
            seen,
        }
        return dto;
    }

    getFollowDto = async (event: Event, notification: Notification) => {
        const {performerUserName, targetId: followingUserName, type, creationDate} = event;
        const {seen, isMine} = notification;
        const dto: FollowNotification = {
            type,
            performerUserName,
            followingUserName,
            creationDate,
            isMine,
            seen,
        }
        return dto;
    }

    getUnreadCount = async (userName: string) => {
        return await this.notificationRepository.getUnreadCount(userName);
    }
    like = async ()
}
