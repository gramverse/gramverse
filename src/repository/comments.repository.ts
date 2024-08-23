import { Model } from "mongoose";
import { commentSchema } from "../models/comment/comment-schema";
import { IComment, Comment } from "../models/comment/comment";
import { CommentRequest } from "../models/comment/comment-request";

export class CommentsRepository {
    private comments: Model<IComment>;
    constructor(private datahandler: typeof import ("mongoose")) {
        this.comments = datahandler.model<IComment>("comments", commentSchema);
    }
    add = async (commentRequest: CommentRequest) => {
        const createdComment = await this.comments.create(commentRequest);
        if (!createdComment) {
            return undefined;
        }
        const newComment: Comment = createdComment;
        return newComment;
    }

    getByPostId = async (postId: string): Promise<Comment[]> => {
        return (await this.comments.find({postId})).map(c => c.toObject());
    }

    getCountByPostId = async (postId: string) => {
        return await this.comments.countDocuments({postId});
    }

    getById = async (_id: string) => {
        const comment = await this.comments.findById(_id);
        return comment||undefined;
    }
}