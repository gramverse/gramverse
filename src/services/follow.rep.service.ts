import {FollowRepository} from "../repository/follow.repository";
import {ErrorCode} from "../errors/error-codes";
import {ForbiddenError, HttpError, UnknownError} from "../errors/http-error";
import {UserRepService} from "./user.rep.service";
import {FollowRequestState} from "../models/follow/follow-request-state";
import {Followinger} from "../models/follow/followinger";
import {Follow} from "../models/follow/follow";

export class FollowRepService {
    constructor(
        private followRepository: FollowRepository,
        private userRepService: UserRepService,
    ) {}

    createFollow = async (follow: Partial<Follow>) => {
        return await this.followRepository.add(follow);
    };

    getFollow = async (followerUserName: string, followingUserName: string) => {
        return await this.followRepository.getFollow(
            followerUserName,
            followingUserName,
        );
    };

    getAllFollowers = async (userName: string) => {
        return (await this.followRepository.getAllFollowers(userName)).map(
            (f) => f.followerUserName,
        );
    };

    getAllFollowings = async (userName: string) => {
        return await this.followRepository.getAllFollowings(userName);
    };

    getFollowerCount = async (userName: string) => {
        return await this.followRepository.getFollowerCount(userName);
    };

    getFollowingCount = async (userName: string) => {
        return await this.followRepository.getFollowingCount(userName);
    }

    getFollowers = async (
        userName: string,
        myUserName: string,
        page: number,
        limit: number,
    ) => {
        await this.checkUserAccess(myUserName, userName);
        const skip = (page - 1) * limit;
        const followers = await this.followRepository.getFollowers(
            userName,
            skip,
            limit,
        );
        const followingers: Followinger[] = [];
        const totalCount =
            await this.followRepository.getFollowerCount(userName);
        const processes = followers.map(async (f) => {
            const user = await this.userRepService.getUser(f.followerUserName);
            if (!user) {
                throw new UnknownError();
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepository.getFollowerCount(
                    user.userName,
                ),
            };
            followingers.push(followinger);
        });
        await Promise.all(processes);
        return {followingers, totalCount};
    };

    getFollowings = async (
        userName: string,
        myUserName: string,
        page: number,
        limit: number,
    ) => {
        await this.checkUserAccess(myUserName, userName);
        const skip = (page - 1) * limit;
        const totalCount =
            await this.followRepository.getFollowingCount(userName);
        const followings = await this.followRepository.getFollowings(
            userName,
            skip,
            limit,
        );
        const followingers: Followinger[] = [];
        for (const f of followings) {
            const user = await this.userRepService.getUser(f.followingUserName);
            if (!user) {
                throw new UnknownError();
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepository.getFollowerCount(
                    user.userName,
                ),
            };
            followingers.push(followinger);
        }
        return {followingers, totalCount};
    };

    getCloseFriends = async (userName: string, page: number, limit: number) => {
        const skip = (page - 1) * limit;
        const totalCount =
            await this.followRepository.getCloseFriendsCount(userName);
        const closeFriends = await this.followRepository.getCloseFriends(
            userName,
            skip,
            limit,
        );
        const followingers: Followinger[] = [];
        for (const f of closeFriends) {
            const user = await this.userRepService.getUser(f.followingUserName);
            if (!user) {
                throw new UnknownError();
            }
            const followinger: Followinger = {
                userName: user.userName,
                profileImage: user.profileImage,
                followerCount: await this.followRepository.getFollowerCount(
                    user.userName,
                ),
            };
            followingers.push(followinger);
        }
        return {followingers, totalCount};
    };

    checkUserAccess = async (myUserName: string, userName: string) => {
        if (userName == myUserName) {
            return;
        }
        const visitorFollow = await this.followRepository.getFollow(
            myUserName,
            userName,
        );
        const creatorFollow = await this.followRepository.getFollow(
            userName,
            myUserName,
        );
        if (visitorFollow && visitorFollow.isBlocked) {
            throw new ForbiddenError("User is blocked by you")
        }
        if (creatorFollow && creatorFollow.isBlocked) {
            throw new ForbiddenError("You are blocked")
        }
        const creatorUser = await this.userRepService.getUser(userName);
        if (!creatorUser) {
            throw new UnknownError();
        }
        if (
            creatorUser.isPrivate &&
            (!visitorFollow ||
                visitorFollow.followRequestState != FollowRequestState.ACCEPTED)
        ) {
            throw new ForbiddenError("User is private");
        }
    };

    update = async (
        followerUserName: string,
        followingUserName: string,
        follow: Partial<Follow>,
    ) => {
        return await this.followRepository.update(
            followerUserName,
            followingUserName,
            follow,
        );
    };

    acceptPendingRequests = async (userName: string) => {
        await this.followRepository.acceptPendingRequests(userName);
    }
}
