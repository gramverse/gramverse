import {Model} from "mongoose";
import {followSchema} from "../models/follow/follow-schema";
import {IFollow, Follow} from "../models/follow/follow";
import {FollowRequestState} from "../models/follow/follow-request-state";
import {convertTypeForArray} from "../utilities/convert-type";

export class BlockRepository {
    private blocks: Model<IFollow>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.blocks = dataHandler.model<IFollow>("follows", followSchema);
    }

    block = async (followerUserName: string, followingUserName: string) => {
        await this.blocks.updateOne(
            {followerUserName, followingUserName},
            {
                isDeleted: true,
                followRequestState: FollowRequestState.NONE,
                isCloseFriend: false,
                isBlocked: true,
            },
        );
    };

    unblock = async (followerUserName: string, followingUserName: string) => {
        await this.blocks.updateOne(
            {followerUserName, followingUserName},
            {isBlocked: false},
        );
    };

    getBlocks = async (followerUserName: string) => {
        const blocks = await this.blocks.find({
            followerUserName,
            isBlocked: true,
        })
        .lean();
        return blocks;
    };

    getBlockList = async (
        followerUserName: string,
        skip: number,
        limit: number,
    ) => {
        const blockList = await this.blocks
            .find({followerUserName, isBlocked: true})
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
        return blockList;
    };

    getBlockListCount = async (followerUserName: string) => {
        return await this.blocks.countDocuments({
            followerUserName,
            isBlocked: true,
        });
    };
}
