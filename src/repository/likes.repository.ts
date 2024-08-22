import { Model } from "mongoose";
import { likeSchema } from "../models/like/like-schema";
import { ILike,Like } from "../models/like/like";

export class LikesRepository {
    private likes: Model<ILike>;
    constructor(private datahandler: typeof import ("mongoose")) {
        this.likes = datahandler.model<ILike>("likes", likeSchema);
    }
    
    add = async (like: Like) => {
        const createdLike = (await this.likes.create(like));
        if (!createdLike) {
            return undefined;
        }
        const newLike: Like = createdLike;
        return newLike;
    }
}