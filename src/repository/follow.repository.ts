import { Model } from "mongoose";
import {followSchema} from "../models/follow/follow-schema";
import {IFollow,Follow} from "../models/follow/follow"
import { FollowRequest } from "../models/follow/follow-request";
import { FollowRequestState } from "../models/follow/follow-request-state";

export class FollowRepository {
    private follows: Model<IFollow>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.follows = dataHandler.model<IFollow>("follows", followSchema);
    }

    add = async (followRequest: FollowRequest) => {
        const createdFollow = (await this.follows.create(followRequest));
        if (!createdFollow) {
            return undefined;
        }
        const newFollow: Follow = createdFollow;
        return newFollow;
    }

    undeleteFollow = async (followerUserName: string, followingUserName: string) => {
        const updateResult = await this.follows.updateOne({followerUserName, followingUserName}, {isDeleted: false, followRequestState: FollowRequestState.ACCEPTED})
        if (!updateResult.acknowledged) {
            return false;
        }
        return true;
    }

    deleteFollow = async (followerUserName: string, followingUserName: string) => {
        const updateResult = await this.follows.updateOne({followerUserName, followingUserName}, {isDeleted: true, followRequestState: FollowRequestState.UNFOLLOW, isCloseFriend: false});
        if (!updateResult.acknowledged) {
            return false;
        }
        return true;
    }

    getFollowerCount = async (userName: string): Promise<number> => {
        return await this.follows.countDocuments({followingUserName: userName, isDeleted: false});
    }

    getFollowingCount = async (userName: string): Promise<number> => {
        return await this.follows.countDocuments({followerUserName: userName, isDeleted: false});
    }

    followExists= async (followerUserName: string, followingUserName: string) => {
        const follow = await this.follows.findOne({followerUserName, followingUserName});
        return follow != null && !follow.isDeleted;
    }

    getFollow = async (followerUserName: string, followingUserName: string) => {
        const follow: Follow|undefined = await this.follows.findOne({followerUserName, followingUserName})||undefined;
        return follow;
    }

    getFollowers = async (followingUserName: string, skip: number, limit: number) => {
        return await this.follows
            .find({ followingUserName, isDeleted: false })
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
    }
    
    getFollowings = async (followerUserName: string, skip: number, limit: number) => {
        return await this.follows
            .find({ followerUserName, isDeleted: false })
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean(); 
    }
    
}