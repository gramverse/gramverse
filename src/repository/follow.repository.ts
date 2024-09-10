import {Model} from "mongoose";
import {followSchema} from "../models/follow/follow-schema";
import {IFollow, Follow} from "../models/follow/follow";
import {FollowRequestState} from "../models/follow/follow-request-state";

export class FollowRepository {
    private follows: Model<IFollow>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.follows = dataHandler.model<IFollow>("follows", followSchema);
    }

    add = async (follow: Partial<Follow>) => {
        const createdFollow = await this.follows.create(follow);
        if (!createdFollow) {
            return undefined;
        }
        const newFollow: Follow = createdFollow;
        return newFollow;
    };

    getFollowerCount = async (userName: string): Promise<number> => {
        return await this.follows.countDocuments({
            followingUserName: userName,
            isDeleted: false,
            followRequestState: FollowRequestState.ACCEPTED,
        });
    };

    getFollowingCount = async (userName: string): Promise<number> => {
        return await this.follows.countDocuments({
            followerUserName: userName,
            isDeleted: false,
            followRequestState: FollowRequestState.ACCEPTED,
        });
    };

    followExists = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        const follow = await this.follows.findOne({
            followerUserName,
            followingUserName,
        });
        return follow != null && !follow.isDeleted;
    };

    getFollow = async (followerUserName: string, followingUserName: string) => {
        const follow: Follow | undefined =
            (await this.follows.findOne({
                followerUserName,
                followingUserName,
            })) || undefined;
        return follow;
    };

    getFollowers = async (
        followingUserName: string,
        skip: number,
        limit: number,
    ) => {
        return await this.follows
            .find({
                followingUserName,
                isDeleted: false,
                followRequestState: FollowRequestState.ACCEPTED,
            })
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
    };

    getFollowings = async (
        followerUserName: string,
        skip: number,
        limit: number,
    ) => {
        return await this.follows
            .find({
                followerUserName,
                isDeleted: false,
                followRequestState: FollowRequestState.ACCEPTED,
            })
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
    };

    getCloseFriends = async (
        followerUserName: string,
        skip: number,
        limit: number,
    ) => {
        return await this.follows
            .find({followerUserName, isDeleted: false, isCloseFriend: true})
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
    };

    getCloseFriendsCount = async (followerUserName: string) => {
        return await this.follows.countDocuments({
            followerUserName,
            isCloseFriend: true,
        });
    };

    getAllFollowers = async (followingUserName: string) => {
        return await this.follows
            .find({
                followingUserName,
                isDeleted: false,
                followRequestState: FollowRequestState.ACCEPTED,
            })
            .lean();
    };

    getAllFollowings = async (followerUserName: string) => {
        return await this.follows
            .find({
                followerUserName,
                followRequestState: FollowRequestState.ACCEPTED,
            })
            .lean();
    };

    getAllCloseFriends = async (followingUserName: string) => {
        return await this.follows
            .find({followingUserName, isCloseFriend: true})
            .lean();
    };

    update = async (
        followerUserName: string,
        followingUserName: string,
        follow: Partial<Follow>,
    ) => {
        const updateResult = await this.follows.updateOne(
            {followerUserName, followingUserName},
            follow,
        );
        return updateResult.acknowledged;
    };

    acceptPendingRequests = async (followingUserName: string) => {
        const updateResult = await this.follows.updateMany(
            {followingUserName, followRequestState: FollowRequestState.PENDING},
            {followRequestState: FollowRequestState.ACCEPTED},
        );
    };
}
