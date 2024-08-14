import { Model } from "mongoose";
import {followSchema} from "../models/follow-schema";
import {IFollow,Follow} from "../models/follow-response"

export class FollowRepository {
    private follows: Model<IFollow>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.follows = dataHandler.model<IFollow>("follows", followSchema);
    }

    add = async (follow: Follow) => {
        const createdFollow = await this.follows.create(follow);
        if (!createdFollow) {
            return undefined;
        }
        const newFollow: Follow = createdFollow;
        return newFollow;
    }

    getFollowerCount = async (userName: string): Promise<number> => {
        return await this.follows.countDocuments({followingUserName: userName});
    }

    getFollowingCount = async (userName: string): Promise<number> => {
        return await this.follows.countDocuments({followerUserName: userName});
    }

    followExists= async (followerUserName: string, followingUserName: string) => {
        const follow = await this.follows.findOne({followerUserName, followingUserName});
        return !!follow;
    }
}