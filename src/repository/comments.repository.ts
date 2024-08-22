import { Model } from "mongoose";
import { commentSchema } from "../models/comment/comment-schema";
import { IComment, Comment } from "../models/comment/comment";

export class CommentsRepository {
    private comments: Model<IComment>;
    constructor(private datahandler: typeof import ("mongoose")) {
        this.comments = datahandler.model<IComment>("comments", commentSchema);
    }
    add = async (comment: Comment) => {
        const createdComment = (await this.comments.create(comment));
        if (!createdComment) {
            return undefined;
        }
        const newComment: Comment = createdComment;
        return newComment;
    }

    getByPostId = async (postId: string): Promise<Comment[]> => {
        return (await this.comments.find({postId}));
    }

    getCountByPostId = async (postId: string) => {
        return await this.comments.countDocuments({postId});
    }
}