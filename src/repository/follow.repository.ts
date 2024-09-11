import {Model} from "mongoose";
import {followSchema} from "../models/follow/follow-schema";
import {IFollow, Follow} from "../models/follow/follow";
import {FollowRequestState} from "../models/follow/follow-request-state";
import {convertType, convertTypeForArray} from "../utilities/convert-type";

export class FollowRepository {
    private follows: Model<IFollow>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.follows = dataHandler.model<IFollow>("follows", followSchema);
    }

    add = async (follow: Partial<Follow>) => {
        const createdFollow = await this.follows.create(follow);
        return createdFollow._id;
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
        return !!follow;
    };

    getFollow = async (followerUserName: string, followingUserName: string) => {
        const follow = await this.follows.findOne({
            followerUserName,
            followingUserName,
        });
        return convertType<Follow, IFollow>(follow);
    };

    getFollowers = async (
        followingUserName: string,
        skip: number,
        limit: number,
    ) => {
        const followers = await this.follows
            .find({
                followingUserName,
                isDeleted: false,
                followRequestState: FollowRequestState.ACCEPTED,
            })
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
        return followers;
    };

    getFollowings = async (
        followerUserName: string,
        skip: number,
        limit: number,
    ) => {
        const followings = await this.follows
            .find({
                followerUserName,
                isDeleted: false,
                followRequestState: FollowRequestState.ACCEPTED,
            })
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
        return followings;
    };

    getCloseFriends = async (
        followerUserName: string,
        skip: number,
        limit: number,
    ) => {
        const closeFriends = await this.follows
            .find({followerUserName, isDeleted: false, isCloseFriend: true})
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
        return closeFriends;
    };

    getCloseFriendsCount = async (followerUserName: string) => {
        return await this.follows.countDocuments({
            followerUserName,
            isCloseFriend: true,
        });
    };

    getAllFollowers = async (followingUserName: string) => {
        const followers = await this.follows.find({
            followingUserName,
            isDeleted: false,
            followRequestState: FollowRequestState.ACCEPTED,
        })
        .lean();
        return followers;
    };

    getAllFollowings = async (followerUserName: string) => {
        const followings = await this.follows.find({
            followerUserName,
            followRequestState: FollowRequestState.ACCEPTED,
        })
        .lean();
        return followings;
    };

    getAllCloseFriends = async (followingUserName: string) => {
        const closeFriends = await this.follows.find({
            followingUserName,
            isCloseFriend: true,
        })
        .lean();
        return closeFriends;
    };

    update = async (
        followerUserName: string,
        followingUserName: string,
        follow: Partial<Follow>,
    ) => {
        await this.follows.updateOne(
            {followerUserName, followingUserName},
            follow,
        );
    };

    acceptPendingRequests = async (followingUserName: string) => {
        await this.follows.updateMany(
            {followingUserName, followRequestState: FollowRequestState.PENDING},
            {followRequestState: FollowRequestState.ACCEPTED},
        );
    };
}
