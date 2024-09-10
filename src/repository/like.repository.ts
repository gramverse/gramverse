import {Model} from "mongoose";
import {likeSchema} from "../models/like/like-schema";
import {ILike, Like} from "../models/like/like";
import {LikeDto} from "../models/like/like-request";
import { convertType } from "../utilities/convert-type";

export class LikesRepository {
    private likes: Model<ILike>;
    constructor(private datahandler: typeof import("mongoose")) {
        this.likes = datahandler.model<ILike>("likes", likeSchema);
    }

    add = async (likeDto: LikeDto) => {
        const createdLike = await this.likes.create(likeDto);
        return createdLike._id;
    };

    getLike = async (userName: string, postId: string) => {
        const like =
            (await this.likes.findOne({userName, postId})) || undefined;
        return convertType<Like, ILike>(like);
    };

    undeleteLike = async (userName: string, postId: string) => {
        await this.likes.updateOne(
            {userName, postId},
            {isDeleted: false},
        );
    };

    deleteLike = async (userName: string, postId: string) => {
        await this.likes.updateOne(
            {userName, postId},
            {isDeleted: true},
        );
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
