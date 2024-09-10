import {Model} from "mongoose";
import {followSchema} from "../models/follow/follow-schema";
import {IFollow, Follow} from "../models/follow/follow";
import {FollowRequestState} from "../models/follow/follow-request-state";

export class BlockRepository {
    private blocks: Model<IFollow>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.blocks = dataHandler.model<IFollow>("follows", followSchema);
    }

    block = async (followerUserName: string, followingUserName: string) => {
        const updateResult = await this.blocks.updateOne(
            {followerUserName, followingUserName},
            {
                isDeleted: true,
                followRequestState: FollowRequestState.NONE,
                isCloseFriend: false,
                isBlocked: true,
            },
        );
        return updateResult.acknowledged;
    };

    unblock = async (followerUserName: string, followingUserName: string) => {
        const updateResult = await this.blocks.updateOne(
            {followerUserName, followingUserName},
            {isBlocked: false},
        );
        return updateResult.acknowledged;
    };

    getBlocks = async (followerUserName: string) => {
        return (
            await this.blocks.find({followerUserName, isBlocked: true})
        ).map((f) => f.toObject());
    };
    getBlockList = async (
        followerUserName: string,
        skip: number,
        limit: number,
    ) => {
        return await this.blocks
            .find({followerUserName, isBlocked: true})
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
    };

    getBlockListCount = async (followerUserName: string) => {
        return await this.blocks.countDocuments({
            followerUserName,
            isBlocked: true,
        });
    };

    blockNonFollowing = async (
        followerUserName: string,
        followingUserName: string,
    ) => {
        return !!(await this.blocks.create({
            followerUserName,
            followingUserName,
            isBlocked: true,
            followRequestState: FollowRequestState.NONE,
        }));
    };
}
