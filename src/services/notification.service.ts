import {NotificationRepository} from "../repository/notification.repository";
import {EventRepository} from "../repository/event.repository";
import {PostRepository} from "../repository/post.repository";
import {CommentsRepository} from "../repository/comments.repository";
import {FollowRepository} from "../repository/follow.repository";
import {UserRepository} from "../repository/user.repository";
import {Event} from "../models/notification/event";
import {Notification, BaseNotification, FollowNotification, FollowRequestNotification, CommentNotification, LikeNotification, MentionNotification} from "../models/notification/notification";
import { EventType } from "../models/notification/event-type";
import {getMockData} from "../utilities/mock";
import {HttpError} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import {FollowRequestState} from "../models/follow/follow-request-state";
import e from "express";
import { Post } from "../models/post/post";


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
                case EventType.FOLLOW_REQUEST:
                    dto = await this.getFollowRequestDto(event, notification);
                    break;
            }
            if (dto) {
                dtos.push(dto);
            }
        }
        const idList = notifications.map(n => n._id.toString());
        this.notificationRepository.markAsRead(idList);
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

    getFollowRequestDto = async (event: Event, notification: Notification) => {
        const {performerUserName, targetId: followingUserName, type, creationDate} = event;
        const {seen, isMine} = notification;
        const dto: FollowRequestNotification = {
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

    like = async(userName: string,postId:string) => {
        const post = await this.postRepository.getPostById(postId)
        if(!post){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Post does not excites");
        }
        const myUserName = post.userName
        const eventId = (await this.addEvent(userName,postId,EventType.LIKE))
        if (!eventId){
            return
        }
        this.addNotification(myUserName,eventId,true)
        
        const followers = (await this.followRepository.getAllFollowers(userName)).map(f=> f.followerUserName);
    
        followers.forEach(async (follower) => {
                const hasAccess = await this.checkPostAccessForNotification(follower, postId);
    
                if (hasAccess) {
                    await this.addNotification(follower, eventId,false);
                }
    
            })
    
    }
    checkPostAccessForNotification = async (userName: string, postId: string) => {
        const post = await this.postRepository.getPostById(postId);
        if (!post) {
            return false
        }
        if (userName == post.userName) {
            return true
        }
        const visitorFollow = await this.followRepository.getFollow(userName, post.userName);
        const creatorFollow = await this.followRepository.getFollow(post.userName, userName);
        if (visitorFollow && visitorFollow.isBlocked) {
            return false
        }
        if (creatorFollow && creatorFollow.isBlocked) {
            return false
        }
        const creatorUser = await this.userRepository.getUserByUserName(post.userName);
        if (!creatorUser) {
            return false
        }   
        if (creatorUser.isPrivate && (!visitorFollow || visitorFollow.followRequestState != FollowRequestState.ACCEPTED)) {
            return false
        }
        return true
    }
    
    addNotification = async(userName: string,eventId:string,isMine: boolean) =>{
        return await this.notificationRepository.add(userName,eventId,isMine)
    }

    addEvent = async (performerUserName: string,targetId: string ,type: string) => {
        return await this.eventRepository.add(performerUserName,targetId,type)
    }

    comment = async(userName: string,postId:string) => {
        const post = await this.postRepository.getPostById(postId)
        if(!post){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Post does not excites");
        }
        const myUserName = post.userName
        const eventId = (await this.addEvent(userName,postId,EventType.COMMENT))
        if (!eventId){
            return
        }
        this.addNotification(myUserName,eventId,true)
        
        const followers = (await this.followRepository.getAllFollowers(userName)).map(f=> f.followerUserName);
    
        followers.forEach(async (follower) => {
                const hasAccess = await this.checkPostAccessForNotification(follower, postId);
    
                if (hasAccess) {
                    await this.addNotification(follower, eventId,false);
                }
    
            })
    
    }

    addMention = async (myUserName: string, mention: string, postId: string) => {
        const eventId = await this.addEvent(myUserName, postId, EventType.MENTION);
        if (!eventId) {
            return;
        }
        await this.addNotification(mention, eventId, true);
    }

    checkUserAccessForFollowNotification = async (followingUserName: string, friendUserName: string) => {
        const followingAndFriend = await this.followRepository.getFollow(followingUserName, friendUserName);
        const friendAndFollowing = await this.followRepository.getFollow(friendUserName, followingUserName);
        if (followingAndFriend && followingAndFriend.isBlocked) {
            return false;
        }
        if (friendAndFollowing && friendAndFollowing.isBlocked){
            return false;
        }
        return true;
    }

    followRequest = async (followerUserName: string, followingUserName: string) => { 
        const eventId = await this.addEvent(followerUserName, followingUserName, EventType.FOLLOW_REQUEST);
        if (!eventId) {
            return;
        }
        this.addNotification(followingUserName, eventId, true);
    }

    follow = async (followerUserName: string, followingUserName: string) => {
        const eventId = await this.addEvent(followerUserName, followingUserName, EventType.FOLLOW);
        if(!eventId) {
            return;
        }
        this.addNotification(followingUserName, eventId, true);

        const followers = (await this.followRepository.getAllFollowers(followerUserName)).map(f=> f.followerUserName);

        followers.forEach(async (follower) => {
            const hasAccess = await this.checkUserAccessForFollowNotification(followerUserName, follower);

            if (hasAccess) {
                await this.addNotification(follower, eventId,false);
            }

        })
    }

    deleteNotif = async(performerUserName:string, targetId:string) => { 
        const eventId = (await this.eventRepository.getEvent(performerUserName, targetId))?._id;
        if (!eventId) {
            return;
        }
        this.eventRepository.deleteEvent(eventId);
        this.notificationRepository.DeleteNotif(eventId);
    }
}
