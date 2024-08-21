import { Model } from "mongoose";
import { commentsLikeSchema } from "../models/commentslike/commentslike-schema";
import { ICommentslike, Commentslike } from "../models/commentslike/commentslike";

export class CommentslikeRepository {
    private commentslikes: Model<ICommentslike>;
    constructor(private datahandler: typeof import ("mongoose")) {
        this.commentslikes = datahandler.model<ICommentslike>("commentslikes", commentsLikeSchema);
    }   
    add = async (commentslike: Commentslike) => {
        const createdCommentslike = (await this.commentslikes.create(commentslike));
        if (!createdCommentslike) {
            return undefined;
        }
        const newCommentslike: Commentslike = createdCommentslike;
        return newCommentslike;
    }

}