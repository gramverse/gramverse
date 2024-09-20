import {NotificationRepository} from "../repository/notification.repository";
import {PostRepService} from "./post.rep.service";
import {CommentRepository} from "../repository/comment.repository";
import {EventService} from "./event.service";
import {FollowService} from "./follow.service";
import {Event} from "../models/notification/event";
import {
    Notification,
    BaseNotification,
    FollowNotification,
    FollowRequestNotification,
    CommentNotification,
    LikeNotification,
    MentionNotification,
} from "../models/notification/notification";
import {EventType} from "../models/notification/event-type";
import {HttpError, UnknownError} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import {FollowRequestState} from "../models/follow/follow-request-state";
import {Post} from "../models/post/post";
import {UserRepService} from "./user.rep.service";
import {FollowRepService} from "./follow.rep.service";
import {unknown} from "zod";
import {CommentService} from "./comment.service";
import {CommentRepService} from "./comment.rep.service";
import { User } from "../models/login/login-response";

export class NotificationService {
    constructor(
        private notificationRepository: NotificationRepository,
        private eventService: EventService,
        private userRepService: UserRepService,
        private followRepService: FollowRepService,
        private postRepService: PostRepService,
        private commentRepService: CommentRepService,
    ) {}

    getNotifications = async (
        userName: string,
        isMine: boolean,
        page: number,
        limit: number,
    ) => {
        const skip = (page - 1) * limit;
        const notifications =
            await this.notificationRepository.getUserNotifications(
                userName,
                isMine,
                skip,
                limit,
            );
        const totalCount =
            await this.notificationRepository.getNotificationCount(
                userName,
                isMine,
            );
        const dtos: BaseNotification[] = [];
        for (const notification of notifications) {
            const event = await this.eventService.getEventById(
                notification.eventId,
            );
            if (!event) {
                throw new UnknownError();
            }
            let dto: BaseNotification | undefined = undefined;
            switch (event.type) {
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
        const idList = notifications.map((n) => n._id.toString());
        this.notificationRepository.markAsRead(idList);
        return {notifications: dtos, totalCount};
    };

    getLikeDto = async (event: Event, notification: Notification) => {
        const {performerUserName, targetId: postId, type, creationDate} = event;
        const {seen, isMine} = notification;
        const post = await this.postRepService.getPostById(postId);
        if (!post) {
            throw new UnknownError();
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
        };
        return dto;
    };

    getCommentDto = async (event: Event, notification: Notification) => {
        const {
            performerUserName,
            targetId: commentId,
            type,
            creationDate,
        } = event;
        const {seen, isMine} = notification;
        const commentObject = await this.commentRepService.getById(commentId);
        if (!commentObject) {
            throw new UnknownError();
        }
        const {comment, postId} = commentObject;
        const post = await this.postRepService.getPostById(postId);
        if (!post) {
            throw new UnknownError();
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
        };
        return dto;
    };

    getMentionDto = async (event: Event, notification: Notification) => {
        const {performerUserName, targetId: postId, type, creationDate} = event;
        const {seen, isMine} = notification;
        const post = await this.postRepService.getPostById(postId);
        if (!post) {
            throw new UnknownError();
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
        };
        return dto;
    };

    getFollowDto = async (event: Event, notification: Notification) => {
        const {
            performerUserName,
            targetId: followingUserName,
            type,
            creationDate,
        } = event;
        const {seen, isMine} = notification;
        let profileUserName: string;
        if (notification.userName == followingUserName) {
            profileUserName = performerUserName;
        } else {
            profileUserName = followingUserName;
        }
        const user = await this.userRepService.getUser(profileUserName);
        if (!user) {
            throw new UnknownError();
        }
        const {profileImage} = user;
        const follow = await this.followRepService.getFollow(notification.userName, profileUserName);
        const {followRequestState} = follow||{
            followRequestState: FollowRequestState.NONE
        };
        const dto: FollowNotification = {
            type,
            performerUserName,
            followingUserName,
            profileImage,
            followRequestState,
            creationDate,
            isMine,
            seen,
        };
        return dto;
    };

    getFollowRequestDto = async (event: Event, notification: Notification) => {
        const {
            performerUserName,
            targetId: followingUserName,
            type,
            creationDate,
        } = event;
        const {seen, isMine} = notification;
        let profileUserName: string;
        if (notification.userName == followingUserName) {
            profileUserName = performerUserName;
        } else {
            profileUserName = followingUserName;
        }
        const user = await this.userRepService.getUser(profileUserName);
        if (!user) {
            throw new UnknownError();
        }
        const {profileImage} = user;
        const dto: FollowRequestNotification = {
            type,
            performerUserName,
            followingUserName,
            profileImage,
            creationDate,
            isMine,
            seen,
        };
        return dto;
    };

    getUnreadCount = async (userName: string) => {
        return await this.notificationRepository.getUnreadCount(userName);
    };

    addLike = async (userName: string, postId: string) => {
        const post = await this.postRepService.getPostById(postId);
        if (!post) {
            throw new UnknownError();
        }
        const eventId = await this.eventService.addEvent(
            userName,
            postId,
            EventType.LIKE,
        );
        if (!eventId) {
            return;
        }
        if (userName != post.userName) {
            await this.createNotification(post.userName, eventId, true);
        }

        const followers = await this.followRepService.getAllFollowers(userName);

        followers.forEach(async (follower) => {
            const hasAccess = await this.checkPostAccessForNotification(
                follower,
                postId,
            );

            if (hasAccess && follower != post.userName) {
                await this.createNotification(follower, eventId, false);
            }
        });
    };

    addComment = async (userName: string, commentId: string) => {
        const comment = await this.commentRepService.getById(commentId);
        if (!comment) {
            return;
        }
        const post = await this.postRepService.getPostById(comment.postId);
        if (!post) {
            return;
        }
        const eventId = await this.eventService.addEvent(
            userName,
            commentId,
            EventType.COMMENT,
        );
        if (!eventId) {
            return;
        }
        if (userName != post.userName) {
            await this.createNotification(post.userName, eventId, true);
        }

        const followers = await this.followRepService.getAllFollowers(userName);

        followers.forEach(async (follower) => {
            const hasAccess = await this.checkPostAccessForNotification(
                follower,
                comment.postId,
            );

            if (hasAccess && follower != post.userName) {
                await this.createNotification(follower, eventId, false);
            }
        });
    };

    addMention = async (
        myUserName: string,
        mentions: string[],
        postId: string,
    ) => {
        const post = await this.postRepService.getPostById(postId);
        if (!post) {
            return;
        }
        let eventId = await this.eventService.getEventId(myUserName, postId, EventType.MENTION);
        if (!eventId) {
            eventId = await this.eventService.addEvent(
                myUserName,
                postId,
                EventType.MENTION,
            );
        }
        for (const mention of mentions) {
            if (mention != post.userName) {
                await this.createNotification(mention, eventId, true);
            }
        }
    };

    addFollow = async (
        followerUserName: string,
        followingUserName: string,
        isAccept: boolean,
    ) => {
        const eventId = await this.eventService.addEvent(
            followerUserName,
            followingUserName,
            EventType.FOLLOW,
        );
        if (!eventId) {
            return;
        }
        await this.createNotification(
            followingUserName,
            eventId,
            true,
        );

        if (isAccept) {
            await this.createNotification(
                followerUserName,
                eventId,
                true,
            );
        }
        const followers =
            await this.followRepService.getAllFollowers(followerUserName);

        followers.forEach(async (follower) => {
            const hasAccess = await this.checkUserAccessForFollowNotification(
                followingUserName,
                follower,
            );

            if (hasAccess && follower != followingUserName) {
                await this.createNotification(follower, eventId, false);
            }
        });
    };

    addFollowRequest = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        const eventId = await this.eventService.addEvent(
            followerUserName,
            followingUserName,
            EventType.FOLLOW_REQUEST,
        );
        if (!eventId) {
            return;
        }
        await this.createNotification(followingUserName, eventId, true);
    };

    checkPostAccessForNotification = async (
        userName: string,
        postId: string,
    ) => {
        const post = await this.postRepService.getPostById(postId);
        if (!post) {
            return false;
        }
        if (userName == post.userName) {
            return true;
        }
        const visitorFollow = await this.followRepService.getFollow(
            userName,
            post.userName,
        );
        const creatorFollow = await this.followRepService.getFollow(
            post.userName,
            userName,
        );
        if (visitorFollow && visitorFollow.isBlocked) {
            return false;
        }
        if (creatorFollow && creatorFollow.isBlocked) {
            return false;
        }
        const creatorUser = await this.userRepService.getUser(post.userName);
        if (!creatorUser) {
            return false;
        }
        if (
            creatorUser.isPrivate &&
            (!visitorFollow ||
                visitorFollow.followRequestState != FollowRequestState.ACCEPTED)
        ) {
            return false;
        }
        return true;
    };

    checkUserAccessForFollowNotification = async (
        followingUserName: string,
        friendUserName: string,
    ) => {
        const following = await this.followRepService.getFollow(
            followingUserName,
            friendUserName,
        );
        const friend = await this.followRepService.getFollow(
            friendUserName,
            followingUserName,
        );
        if (following && following.isBlocked) {
            return false;
        }
        if (friend && friend.isBlocked) {
            return false;
        }
        return true;
    };

    createNotification = async (
        userName: string,
        eventId: string,
        isMine: boolean,
    ) => {
        return await this.notificationRepository.add(userName, eventId, isMine);
    };

    deleteNotification = async (
        performerUserName: string,
        targetId: string,
        type: EventType,
    ) => {
        const eventId = await this.eventService.getEventId(
            performerUserName,
            targetId,
            type,
        );
        if (!eventId) {
            return;
        }
        await this.eventService.deleteEvent(eventId);
        await this.notificationRepository.deleteNotificationByEventId(
            eventId.toString(),
        );
    };

    deleteMentionNotifications = async (eventId: string, mentions: string[]) => {
        for (const mention of mentions) {
            this.notificationRepository.deleteNotification(eventId, mention);
        }
    }

    updateAll = async () => {
        const allEvents = await this.eventService.getAllEvents();
        let counter = 0;
        let result = "";
        for (const event of allEvents) {
            if (event.type == EventType.LIKE
                || event.type == EventType.MENTION
            ) {
                if (!(await this.postRepService.getPostById(event.targetId))) {
                    await this.eventService.deleteEvent(event._id);
                    counter++;
                    result += `${event.type}: ${event.performerUserName} on ${event.targetId}\n`;
                }
            } else if (event.type == EventType.COMMENT) {
                const comment = await this.commentRepService.getById(event.targetId);
                if (!comment
                    || !(await this.postRepService.getPostById(comment.postId))
                ) {
                    await this.eventService.deleteEvent(event._id);
                    counter++;
                    result += `${event.type}: ${event.performerUserName} on ${event.targetId}\n`;
                }
            } else if (event.type == EventType.FOLLOW) {
                const follow = await this.followRepService.getFollow(event.performerUserName, event.targetId);
                if (!follow || follow.followRequestState != FollowRequestState.ACCEPTED) {
                    await this.eventService.deleteEvent(event._id);
                    counter++;
                    result += `${event.type}: ${event.performerUserName} to ${event.targetId}\n`;
                }
            } else {
                const follow = await this.followRepService.getFollow(event.performerUserName, event.targetId);
                if (!follow || follow.followRequestState != FollowRequestState.PENDING) {
                    await this.eventService.deleteEvent(event._id);
                    counter++;
                    result += `${event.type}: ${event.performerUserName} to ${event.targetId}\n`;
                }
            }
        }
        return result+`Number of deleted events: ${counter}`;
    }

    deleteEventlessNotifications = async () => {
        const allNotifications = await this.notificationRepository.getAllNotifications();
        let counter = 0;
        for (const n of allNotifications) {
            if (!(await this.eventService.getEventById(n.eventId))) {
                await this.notificationRepository.deleteNotificationById(n._id);
                counter++;
            }
        }
        return `Number of deleted notifications: ${counter}`;
    }
}
