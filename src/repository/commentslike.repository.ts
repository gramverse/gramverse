import { Model } from "mongoose";
import { commentsLikeSchema } from "../models/commentslike/commentslike-schema";
import { ICommentslike, Commentslike } from "../models/commentslike/commentslike";
import { CommentsLikeDto } from "../models/commentslike/commentslike-request";

export class CommentslikeRepository {
    private commentslikes: Model<ICommentslike>;
    constructor(private datahandler: typeof import ("mongoose")) {
        this.commentslikes = datahandler.model<ICommentslike>("commentslikes", commentsLikeSchema);
    }   

    add = async (commentsLikeDto: CommentsLikeDto) => {
        const createdCommentslike = (await this.commentslikes.create(commentsLikeDto));
        if (!createdCommentslike) {
            return undefined;
        }
        const newCommentslike: Commentslike = createdCommentslike;
        return newCommentslike;
    }

    getCountByCommentId = async (commentId: string) => {
        return await this.commentslikes.countDocuments({commentId, isDeleted: false});
    }

    commentslikeExists = async (userName: string, commentId: string) => {
        const commentslike = await this.commentslikes.findOne({userName, commentId, isDeleted: false});
        return !!commentslike;
    }

    getCommentsLike = async (userName: string, commentId: string) => {
        const commentLike: Commentslike|undefined = await this.commentslikes.findOne({userName, commentId})||undefined
        return commentLike;
    }
    undeleteCommentsLike = async (userName: string, commentId: string) => {
        const updateResult = await this.commentslikes.updateOne({userName, commentId}, {isDeleted: false});
        if (!updateResult.acknowledged){
            return false;
        }
        return true;
    }

    deleteCommentsLike = async (userName: string, commentId: string) => {
        const updateResult = await this.commentslikes.updateOne({userName, commentId}, {isDeleted: true});
        if (!updateResult.acknowledged){
            return false;
        }
        return true;
    }


}