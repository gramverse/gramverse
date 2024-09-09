import {Model} from "mongoose";
import {likeSchema} from "../models/like/like-schema";
import {ILike, Like} from "../models/like/like";
import {LikeDto} from "../models/like/like-request";

export class LikesRepository {
    private likes: Model<ILike>;
    constructor(private datahandler: typeof import("mongoose")) {
        this.likes = datahandler.model<ILike>("likes", likeSchema);
    }

    add = async (likeDto: LikeDto) => {
        const createdLike = await this.likes.create(likeDto);
        if (!createdLike) {
            return undefined;
        }
        const newLike: Like = createdLike;
        return newLike;
    };

    getLike = async (userName: string, postId: string) => {
        const like: Like | undefined =
            (await this.likes.findOne({userName, postId})) || undefined;
        return like;
    };

    undeleteLike = async (userName: string, postId: string) => {
        const updateResult = await this.likes.updateOne(
            {userName, postId},
            {isDeleted: false},
        );
        if (!updateResult.acknowledged) {
            return false;
        }
        return true;
    };
    deleteLike = async (userName: string, postId: string) => {
        const updateResult = await this.likes.updateOne(
            {userName, postId},
            {isDeleted: true},
        );
        if (!updateResult.acknowledged) {
            return false;
        }
        return true;
    };

    getCountByPostId = async (postId: string) => {
        return await this.likes.countDocuments({postId, isDeleted: false});
    };

    likeExists = async (userName: string, postId: string) => {
        const like = await this.likes.findOne({
            userName,
            postId,
            isDeleted: false,
        });
        return !!like;
    };
}
