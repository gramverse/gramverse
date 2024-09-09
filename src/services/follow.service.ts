import { ErrorCode } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import {UserRepository} from "../repository/user.repository";
import { FollowRepService } from "./follow.rep.service";
import { FollowRequestState } from "../models/follow/follow-request-state";
import { UserRepService } from "./userRep.service";
import { NotificationService } from "./notification.service";
import {Followinger} from "../models/follow/followinger";
import {BlockRepository} from "../repository/block.repository"

export class FollowService {
    constructor(private followRepService: FollowRepService, private userRepService: UserRepService, private notificationService: NotificationService, private blockRepository: BlockRepository) {}

    follow = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't follow yourself");
        }
        const user = await this.userRepService.getUser(followingUserName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        if (user.isPrivate) {
            return await this.sendFollowRequest(followerUserName, followingUserName);
        }
        const existingFollow = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (existingFollow) {
            if (existingFollow.followRequestState == FollowRequestState.ACCEPTED) {
                return true;
            }
            return await this.followRepService.update(followerUserName, followingUserName, {followRequestState: FollowRequestState.ACCEPTED});
        }
        const createdFollow = await this.followRepService.createFollow({followerUserName, followingUserName});
        if (createdFollow) {
            this.notificationService.addFollow(followerUserName, followingUserName, false)
        }
        return !!createdFollow;
    }

    sendFollowRequest = async (followerUserName: string, followingUserName: string) => {
        const existingFollow = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (existingFollow) {
            if (existingFollow.followRequestState == FollowRequestState.ACCEPTED
            || existingFollow.followRequestState == FollowRequestState.PENDING) {
                return true;
            }
            const success = await this.followRepService.update(followerUserName, followingUserName, {followRequestState: FollowRequestState.PENDING});
            if (success) {
                this.notificationService.addFollowRequest(followerUserName, followingUserName)
            }
            return success;
        }
        const createdFollow = await this.followRepService.createFollow({followerUserName, followingUserName, followRequestState: FollowRequestState.PENDING});
        if (createdFollow) {
            this.notificationService.addFollowRequest(followerUserName, followingUserName)
        }
        return !!createdFollow;
    }

    unfollow = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't unfollow yourself");
        }
        const user = await this.userRepService.getUser(followingUserName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        const existingFollow = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.isDeleted) {
            return true;
        }
        const success = await this.followRepService.update(followerUserName, followingUserName, {followRequestState: FollowRequestState.NONE, isCloseFriend: false});
        if (success) {
            this.notificationService.deleteNotification(followerUserName, followingUserName);
        }
        return success;
    }

    acceptRequest = async (followerUserName: string, followingUserName: string) => {
        const existingFollow = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.followRequestState != FollowRequestState.PENDING) {
            throw new HttpError(400, ErrorCode.NO_SUCH_REQUEST, "You have no follow request from this username");
        }
        const success = await this.followRepService.update(followerUserName, followingUserName, {followRequestState: FollowRequestState.ACCEPTED});
        if (success) {
            this.notificationService.addFollow(followerUserName, followingUserName, true);
        }
        return success;
    }

    declineRequest = async (followerUserName: string, followingUserName: string) => {
        const existingFollow = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.followRequestState != FollowRequestState.PENDING) {
            throw new HttpError(400, ErrorCode.NO_SUCH_REQUEST, "You have no follow request from this username");
        }
        const success = await this.followRepService.update(followerUserName, followingUserName, {followRequestState: FollowRequestState.DECLINED});
        if (success) {
            this.notificationService.deleteNotification(followerUserName, followingUserName);
        }
        return success;
    }
    
    addCloseFriend = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't add yourself to close friends");
        }
        const user = await this.userRepService.getUser(followingUserName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        const existingFollow = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.followRequestState != FollowRequestState.ACCEPTED) {
            throw new HttpError(403, ErrorCode.USER_IS_NOT_FOLLOWED, "Close friend must be your following");
        }
        if (existingFollow.isCloseFriend) {
            return true;
        }
        return await this.followRepService.update(followerUserName, followingUserName, {isCloseFriend: true});
    }

    removeCloseFriend = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't remove yourself from close friends");
        }
        const user = await this.userRepService.getUser(followingUserName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        const existingFollow = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.followRequestState != FollowRequestState.ACCEPTED) {
            throw new HttpError(403, ErrorCode.USER_IS_NOT_FOLLOWED, "Close friend must be your following");
        }
        if (!existingFollow.isCloseFriend) {
            return true;
        }
        return await this.followRepService.update(followerUserName, followingUserName, {isCloseFriend: false});
    }

    block = async(followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't block yourself");
        }
        const existingBlock = await this.followRepService.getFollow(followerUserName, followingUserName);
        const userExists = await this.userRepService.checkUserNameExistance(followingUserName)
        if (!userExists) {
            throw new HttpError(400, ErrorCode.USER_NOT_FOUND,"Blocking UserName not exists")
        }
        if (existingBlock) {
            if (existingBlock.isBlocked) {
                return true;
            }
            await this.followRepService.update(followingUserName,followerUserName, {followRequestState: FollowRequestState.NONE, isCloseFriend: false});
            return await this.blockRepository.block(followerUserName, followingUserName);
        }
        return await this.blockRepository.blockNonFollowing(followerUserName,followingUserName)
    }

    unBlock = async(followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't unblock yourself");
        }
        const existingBlock = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (!existingBlock) {
            return true;
        }
        return await this.blockRepository.unblock(followerUserName, followingUserName)
    }    
    getBlackList = async (userName: string,page: number,limit: number) => {
        const skip = (page -1) * limit;
        const totalCount = await this.blockRepository.getBlockListCount(userName);
        const blockList = await this.blockRepository.getBlockList(userName,skip, limit);
        const followingers: Followinger[] = [];
        for (const f of blockList) {
            const user = await this.userRepService.getUser(f.followingUserName);
            if (!user) {
                throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Database integrity error");
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepService.getFollowerCount(user.userName),
            };
            followingers.push(followinger);
        }
        return {followingers, totalCount};
    }

    removeFollow = async (followerUserName: string, followingUserName: string) => {
        const user = await this.userRepService.getUser(followerUserName)
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        const existingFollow = await this.followRepService.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.isDeleted) {
            return true;
        }
        return await this.followRepService.update(followerUserName, followingUserName, {followRequestState: FollowRequestState.NONE, isCloseFriend: false});
    }
}