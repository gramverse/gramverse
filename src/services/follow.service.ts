import { ErrorCode } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import {UserRepository} from "../repository/user.repository";
import { FollowRepository } from "../repository/follow.repository";
import { FollowRequestState } from "../models/follow/follow-request-state";
import { NotificationService } from "./notification.service";
import {Followinger} from "../models/follow/followinger";
import {BlockRepository} from "../repository/block.repository"

export class FollowService {
    constructor(private notificationService: NotificationService, private followRepository: FollowRepository, private userRepository: UserRepository, private blockRepository: BlockRepository) {}

    follow = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't follow yourself");
        }
        const user = await this.userRepository.getUserByUserName(followingUserName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        if (user.isPrivate) {
            return await this.sendFollowRequest(followerUserName, followingUserName);
        }
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (existingFollow) {
            if (existingFollow.followRequestState == FollowRequestState.ACCEPTED) {
                return true;
            }
            return await this.followRepository.undeleteFollow(followerUserName, followingUserName);
        }
        const createdFollow = await this.followRepository.add(followerUserName, followingUserName);
        if (createdFollow) {
            this.notificationService.addFollow(followerUserName, followingUserName, false)
        }
        return !!createdFollow;
    }

    sendFollowRequest = async (followerUserName: string, followingUserName: string) => {
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (existingFollow) {
            if (existingFollow.followRequestState == FollowRequestState.ACCEPTED
            || existingFollow.followRequestState == FollowRequestState.PENDING) {
                return true;
            }
            const success = await this.followRepository.setFollowAsPending(followerUserName, followingUserName);
            if (success) {
                this.notificationService.addFollowRequest(followerUserName, followingUserName)
            }
            return success;
        }
        const createdFollow = await this.followRepository.add(followerUserName, followingUserName, FollowRequestState.PENDING);
        if (createdFollow) {
            this.notificationService.addFollowRequest(followerUserName, followingUserName)
        }
        return !!createdFollow;
    }

    unfollow = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't unfollow yourself");
        }
        const user = await this.userRepository.getUserByUserName(followingUserName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.isDeleted) {
            return true;
        }
        const success = await this.followRepository.deleteFollow(followerUserName, followingUserName);
        if (success) {
            this.notificationService.deleteNotification(followerUserName, followingUserName);
        }
        return success;
    }

    acceptRequest = async (followerUserName: string, followingUserName: string) => {
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.followRequestState != FollowRequestState.PENDING) {
            throw new HttpError(400, ErrorCode.NO_SUCH_REQUEST, "You have no follow request from this username");
        }
        const success = await this.followRepository.undeleteFollow(followerUserName, followingUserName);
        if (success) {
            this.notificationService.addFollow(followerUserName, followingUserName, true);
        }
        return success;
    }

    declineRequest = async (followerUserName: string, followingUserName: string) => {
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.followRequestState != FollowRequestState.PENDING) {
            throw new HttpError(400, ErrorCode.NO_SUCH_REQUEST, "You have no follow request from this username");
        }
        const success = await this.followRepository.declineFollow(followerUserName, followingUserName);
        if (success) {
            this.notificationService.deleteNotification(followerUserName, followingUserName);
        }
        return success;
    }

    getFollow = async (followerUserName: string, followingUserName: string) => {
        return await this.followRepository.getFollow(followerUserName, followingUserName);
    }

    getFollowers = async (userName: string,myUserName: string, page: number,limit: number) => {
        await this.checkUserAccess(myUserName, userName);
        const skip = (page -1) * limit
        const followers = await this.followRepository.getFollowers(userName,skip,limit);
        const followingers: Followinger[] = [];
        const totalCount = await this.followRepository.getFollowerCount(userName)
        const processes = followers.map(async f => {
            const user = await this.userRepository.getUserByUserName(f.followerUserName);
            if (!user) {
                throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Database integrity error");
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepository.getFollowerCount(user.userName),
            };
            followingers.push(followinger);
        });
        await Promise.all(processes);
        return {followingers ,totalCount};
    }

    getFollowings = async (userName: string,myUserName: string, page: number,limit: number) => {
        await this.checkUserAccess(myUserName, userName);
        const skip = (page -1) * limit
        const totalCount = await this.followRepository.getFollowingCount(userName)
        const followings = await this.followRepository.getFollowings(userName,skip,limit);
        const followingers: Followinger[] = [];
        for (const f of followings) {
            const user = await this.userRepository.getUserByUserName(f.followingUserName);
            if (!user) {
                throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Database integrity error");
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepository.getFollowerCount(user.userName),
            };
            followingers.push(followinger);
        }
        return {followingers ,totalCount};
    }

    getAllFollowers = async (userName: string) => {
        return await this.followRepository.getAllFollowers(userName);
    }

    getCloseFriends = async (userName: string,page: number,limit: number) => {
        const skip = (page -1) * limit;
        const totalCount = await this.followRepository.getCloseFriendsCount(userName);
        const closeFriends = await this.followRepository.getCloseFriends(userName,skip, limit);
        const followingers: Followinger[] = [];
        for (const f of closeFriends) {
            const user = await this.userRepository.getUserByUserName(f.followingUserName);
            if (!user) {
                throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Database integrity error");
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepository.getFollowerCount(user.userName),
            };
            followingers.push(followinger);
        }
        return {followingers, totalCount};
    }   

    addCloseFriend = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't add yourself to close friends");
        }
        const user = await this.userRepository.getUserByUserName(followingUserName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.followRequestState != FollowRequestState.ACCEPTED) {
            throw new HttpError(403, ErrorCode.USER_IS_NOT_FOLLOWED, "Close friend must be your following");
        }
        if (existingFollow.isCloseFriend) {
            return true;
        }
        return await this.followRepository.addCloseFriend(followerUserName, followingUserName);
    }

    removeCloseFriend = async (followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't remove yourself from close friends");
        }
        const user = await this.userRepository.getUserByUserName(followingUserName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.followRequestState != FollowRequestState.ACCEPTED) {
            throw new HttpError(403, ErrorCode.USER_IS_NOT_FOLLOWED, "Close friend must be your following");
        }
        if (!existingFollow.isCloseFriend) {
            return true;
        }
        return await this.followRepository.removeCloseFriend(followerUserName, followingUserName);
    }

    block = async(followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't block yourself");
        }
        const existingBlock = await this.followRepository.getFollow(followerUserName, followingUserName);
        const userExists = await this.userRepository.checkUserNameExistance(followingUserName)
        if (!userExists) {
            throw new HttpError(400, ErrorCode.USER_NOT_FOUND,"Blocking UserName not exists")
        }
        if (existingBlock) {
            if (existingBlock.isBlocked) {
                return true;
            }
            await this.followRepository.deleteFollow(followingUserName,followerUserName)
            return await this.blockRepository.block(followerUserName, followingUserName);
        }
        return await this.blockRepository.blockNonFollowing(followerUserName,followingUserName)
    }

    unBlock = async(followerUserName: string, followingUserName: string) => {
        if (followerUserName == followingUserName) {
            throw new HttpError(400, ErrorCode.INVALID_FOLLOW_REQUEST, "You can't unblock yourself");
        }
        const existingBlock = await this.followRepository.getFollow(followerUserName, followingUserName);
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
            const user = await this.userRepository.getUserByUserName(f.followingUserName);
            if (!user) {
                throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Database integrity error");
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepository.getFollowerCount(user.userName),
            };
            followingers.push(followinger);
        }
        return {followingers, totalCount};
    }

    removeFollow = async (followerUserName: string, followingUserName: string) => {
        const user = await this.userRepository.getUserByUserName(followerUserName)
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.isDeleted) {
            return true;
        }
        return await this.followRepository.deleteFollow(followerUserName, followingUserName);
    }

    checkUserAccess = async (myUserName: string, userName: string) => {
        if (userName == myUserName) {
            return;
        }
        const visitorFollow = await this.followRepository.getFollow(myUserName, userName);
        const creatorFollow = await this.followRepository.getFollow(userName, myUserName);
        if (visitorFollow && visitorFollow.isBlocked) {
            throw new HttpError(403, ErrorCode.CREATOR_IS_BLOCKED_BY_YOU, "You have blocked this user");
        }
        if (creatorFollow && creatorFollow.isBlocked) {
            throw new HttpError(403, ErrorCode.YOU_ARE_BLOCKED, "This user has blocked you");
        }
        const creatorUser = await this.userRepository.getUserByUserName(userName);
        if (!creatorUser) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "post username doesn't exist in users");
        }
        if (creatorUser.isPrivate && (!visitorFollow || visitorFollow.followRequestState != FollowRequestState.ACCEPTED)) {
            throw new HttpError(403, ErrorCode.USER_IS_PRIVATE, "User is private");
        }
    }
}