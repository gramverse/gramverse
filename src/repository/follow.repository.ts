import { Model } from "mongoose";
import {followSchema} from "../models/follow/follow-schema";
import {IFollow,Follow} from "../models/follow/follow"

export class FollowRepository {
    private follows: Model<IFollow>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.follows = dataHandler.model<IFollow>("follows", followSchema);
    }

    add = async (follow: Follow) => {
        const createdFollow = (await this.follows.create(follow));
        if (!createdFollow) {
            return undefined;
        }
        const newFollow: Follow = createdFollow;
        return newFollow;
    }

    undeleteFollow = async (followerUserName: string, followingUserName: string) => {
        const updateResult = await this.follows.updateOne({followerUserName, followingUserName}, {isDeleted: false})
        if (!updateResult.acknowledged) {
            return false;
        }
        return true;
    }

    deleteFollow = async (followerUserName: string, followingUserName: string) => {
        const updateResult = await this.follows.updateOne({followerUserName, followingUserName}, {isDeleted: true})
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
}