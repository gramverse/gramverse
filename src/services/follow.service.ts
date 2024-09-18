import {ErrorCode} from "../errors/error-codes";
import {
    ForbiddenError,
    HttpError,
    NotFoundError,
    UnknownError,
} from "../errors/http-error";
import {UserRepository} from "../repository/user.repository";
import {FollowRepService} from "./follow.rep.service";
import {FollowRequestState} from "../models/follow/follow-request-state";
import {UserRepService} from "./user.rep.service";
import {NotificationService} from "./notification.service";
import {Followinger} from "../models/follow/followinger";
import {BlockRepository} from "../repository/block.repository";
import { User } from "../models/login/login-response";
import { EventType } from "../models/notification/event-type";

export class FollowService {
    constructor(
        private followRepService: FollowRepService,
        private userRepService: UserRepService,
        private notificationService: NotificationService,
        private blockRepository: BlockRepository,
    ) {}

    follow = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(
                400,
                ErrorCode.INVALID_FOLLOW_REQUEST,
                "You can't follow yourself",
            );
        }
        const user = await this.userRepService.getUser(followingUserName);
        if (!user) {
            throw new NotFoundError("user");
        }
        if (user.isPrivate) {
            await this.sendFollowRequest(followerUserName, followingUserName);
            return;
        }
        const existingFollow = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (existingFollow) {
            if (
                existingFollow.followRequestState == FollowRequestState.ACCEPTED
            ) {
                return;
            }
            await this.followRepService.update(
                followerUserName,
                followingUserName,
                {followRequestState: FollowRequestState.ACCEPTED},
            );
            await this.updateFollowerCount(followingUserName);
            return;
        }
        await this.followRepService.createFollow({
            followerUserName,
            followingUserName,
        });
        await this.updateFollowerCount(followingUserName);
        this.notificationService.addFollow(
            followerUserName,
            followingUserName,
            false,
        );
    };

    sendFollowRequest = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        const existingFollow = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (existingFollow) {
            if (
                existingFollow.followRequestState ==
                    FollowRequestState.ACCEPTED ||
                existingFollow.followRequestState == FollowRequestState.PENDING
            ) {
                return;
            }
            await this.followRepService.update(
                followerUserName,
                followingUserName,
                {followRequestState: FollowRequestState.PENDING},
            );
            this.notificationService.addFollowRequest(
                followerUserName,
                followingUserName,
            );
            return;
        }

        await this.followRepService.createFollow({
            followerUserName,
            followingUserName,
            followRequestState: FollowRequestState.PENDING,
        });
        this.notificationService.addFollowRequest(
            followerUserName,
            followingUserName,
        );
    };

    unfollow = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(
                400,
                ErrorCode.INVALID_FOLLOW_REQUEST,
                "You can't unfollow yourself",
            );
        }
        const user = await this.userRepService.getUser(followingUserName);
        if (!user) {
            throw new NotFoundError("user");
        }
        const existingFollow = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (
            !existingFollow ||
            (existingFollow.followRequestState != FollowRequestState.ACCEPTED
                && existingFollow.followRequestState != FollowRequestState.PENDING)
        ) {
            return;
        }
        if (existingFollow.followRequestState == FollowRequestState.PENDING) {
            await this.followRepService.update(
                followerUserName,
                followingUserName,
                {followRequestState: FollowRequestState.NONE},
            );
            this.notificationService.deleteNotification(
                followerUserName,
                followingUserName,
                EventType.FOLLOW_REQUEST,
            );
            } else {
            await this.followRepService.update(
                followerUserName,
                followingUserName,
                {followRequestState: FollowRequestState.NONE, isCloseFriend: false},
            );  
            await this.updateFollowerCount(followingUserName);
            this.notificationService.deleteNotification(
                followerUserName,
                followingUserName,
                EventType.FOLLOW,
            );
        }
    };

    acceptRequest = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        const existingFollow = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (
            !existingFollow ||
            existingFollow.followRequestState != FollowRequestState.PENDING
        ) {
            throw new HttpError(
                400,
                ErrorCode.NO_SUCH_REQUEST,
                "You have no follow request from this username",
            );
        }
        await this.followRepService.update(
            followerUserName,
            followingUserName,
            {followRequestState: FollowRequestState.ACCEPTED},
        );
        await this.updateFollowerCount(followingUserName);
        this.notificationService.addFollow(
            followerUserName,
            followingUserName,
            true,
        );
        this.notificationService.deleteNotification(followerUserName, followingUserName, EventType.FOLLOW_REQUEST);
    };

    declineRequest = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        const existingFollow = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (
            !existingFollow ||
            existingFollow.followRequestState != FollowRequestState.PENDING
        ) {
            throw new HttpError(
                400,
                ErrorCode.NO_SUCH_REQUEST,
                "You have no follow request from this username",
            );
        }
        await this.followRepService.update(
            followerUserName,
            followingUserName,
            {followRequestState: FollowRequestState.DECLINED},
        );
        this.notificationService.deleteNotification(
            followerUserName,
            followingUserName,
            EventType.FOLLOW_REQUEST,
        );
    };

    addCloseFriend = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(
                400,
                ErrorCode.INVALID_FOLLOW_REQUEST,
                "You can't add yourself to close friends",
            );
        }
        const user = await this.userRepService.getUser(followingUserName);
        if (!user) {
            throw new NotFoundError("user");
        }
        const existingFollow = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (
            !existingFollow ||
            existingFollow.followRequestState != FollowRequestState.ACCEPTED
        ) {
            throw new ForbiddenError("User is not followed");
        }
        if (existingFollow.isCloseFriend) {
            return;
        }
        await this.followRepService.update(
            followerUserName,
            followingUserName,
            {isCloseFriend: true},
        );
    };

    removeCloseFriend = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(
                400,
                ErrorCode.INVALID_FOLLOW_REQUEST,
                "You can't remove yourself from close friends",
            );
        }
        const user = await this.userRepService.getUser(followingUserName);
        if (!user) {
            throw new NotFoundError("user");
        }
        const existingFollow = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (
            !existingFollow ||
            existingFollow.followRequestState != FollowRequestState.ACCEPTED
        ) {
            throw new ForbiddenError("User is not followed");
        }
        if (!existingFollow.isCloseFriend) {
            return;
        }
        await this.followRepService.update(
            followerUserName,
            followingUserName,
            {isCloseFriend: false},
        );
    };

    block = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(
                400,
                ErrorCode.INVALID_FOLLOW_REQUEST,
                "You can't block yourself",
            );
        }
        const existingBlock = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        const userExists =
            await this.userRepService.checkUserNameExistance(followingUserName);
        if (!userExists) {
            throw new NotFoundError("user");
        }
        if (existingBlock) {
            if (existingBlock.isBlocked) {
                return;
            }
            await this.followRepService.update(
                followingUserName,
                followerUserName,
                {
                    followRequestState: FollowRequestState.NONE,
                    isCloseFriend: false,
                },
            );
            await this.blockRepository.block(
                followerUserName,
                followingUserName,
            );
            await this.updateFollowerCount(followingUserName);
        }
        await this.followRepService.createFollow({
            followerUserName,
            followingUserName,
            isBlocked: true,
            followRequestState: FollowRequestState.NONE,
            isCloseFriend: false,
        });
    };

    unBlock = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(
                400,
                ErrorCode.INVALID_FOLLOW_REQUEST,
                "You can't unblock yourself",
            );
        }
        const existingBlock = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (!existingBlock) {
            return;
        }
        await this.blockRepository.unblock(followerUserName, followingUserName);
    };

    getBlackList = async (userName: string, page: number, limit: number) => {
        const skip = (page - 1) * limit;
        const totalCount =
            await this.blockRepository.getBlockListCount(userName);
        const blockList = await this.blockRepository.getBlockList(
            userName,
            skip,
            limit,
        );
        const followingers: Followinger[] = [];
        for (const f of blockList) {
            const user = await this.userRepService.getUser(f.followingUserName);
            if (!user) {
                throw new UnknownError();
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepService.getFollowerCount(
                    user.userName,
                ),
            };
            followingers.push(followinger);
        }
        return {followingers, totalCount};
    };

    removeFollow = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        const user = await this.userRepService.getUser(followerUserName);
        if (!user) {
            throw new NotFoundError("user");
        }
        const existingFollow = await this.followRepService.getFollow(
            followerUserName,
            followingUserName,
        );
        if (
            !existingFollow ||
            existingFollow.followRequestState != FollowRequestState.ACCEPTED
        ) {
            return;
        }
        await this.followRepService.update(
            followerUserName,
            followingUserName,
            {followRequestState: FollowRequestState.NONE, isCloseFriend: false},
        );
        await this.updateFollowerCount(followingUserName);
    };

    updateFollowerCount = async (userName: string) => {
        const followerCount =
            await this.followRepService.getFollowerCount(userName);
        await this.userRepService.updateUser(userName, {followerCount});
    };

    updateAllUsers = async () => {
        const allUsers = await this.userRepService.getAllUsers();
        let counter = 0;
        for (const user of allUsers) {
            await this.updateFollowerCount(user.userName);
            const updatedUser: Partial<User> = {};
            updatedUser.normalizedUserName = user.userName.toUpperCase();
            updatedUser.normalizedEmail = user.email.toUpperCase();

            await this.userRepService.updateUser(user.userName, updatedUser);
            console.log(updatedUser.normalizedUserName);
            counter++;
        }
        return `Number of changes: ${counter}`;
    };
}
