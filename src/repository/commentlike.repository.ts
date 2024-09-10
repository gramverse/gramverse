import {Model} from "mongoose";
import {commentsLikeSchema} from "../models/commentslike/commentslike-schema";
import {
    ICommentslike as ICommentLike,
    Commentslike as CommentLike,
} from "../models/commentslike/commentslike";
import {CommentsLikeDto} from "../models/commentslike/commentslike-request";
import {convertType} from "../utilities/convert-type";

export class CommentLikeRepository {
    private commentslikes: Model<ICommentLike>;
    constructor(private datahandler: typeof import("mongoose")) {
        this.commentslikes = datahandler.model<ICommentLike>(
            "commentslikes",
            commentsLikeSchema,
        );
    }

    add = async (commentsLikeDto: CommentsLikeDto) => {
        const createdCommentslike =
            await this.commentslikes.create(commentsLikeDto);
        return createdCommentslike._id;
    };

    getCountByCommentId = async (commentId: string) => {
        return await this.commentslikes.countDocuments({
            commentId,
            isDeleted: false,
        });
    };

    commentslikeExists = async (userName: string, commentId: string) => {
        const commentslike = await this.commentslikes.findOne({
            userName,
            commentId,
            isDeleted: false,
        });
        return !!commentslike;
    };

    getCommentLike = async (userName: string, commentId: string) => {
        const commentLike = await this.commentslikes.findOne({
            userName,
            commentId,
        });
        return convertType<CommentLike, ICommentLike>(commentLike);
    };

    undeleteCommentLike = async (userName: string, commentId: string) => {
        await this.commentslikes.updateOne(
            {userName, commentId},
            {isDeleted: false},
        );
    };

    deleteCommentLike = async (userName: string, commentId: string) => {
        await this.commentslikes.updateOne(
            {userName, commentId},
            {isDeleted: true},
        );
    };
}
