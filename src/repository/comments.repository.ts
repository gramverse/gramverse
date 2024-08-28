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

    getByPostId = async (postId: string,skip: number, limit: number): Promise<Comment[]> => {
        const parents: Comment[] = (await this.comments
            .find({postId, parentCommentId: ""})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit))
            .map(c => c.toObject());
        const promises = parents.map(async p => {
            p.childComments = await this.getByParentId(p._id);
        })
        await Promise.all(promises);
        return parents;
    }

    getByParentId = async (parentCommentId: string) => {
        const parents: Comment[] = (await this.comments
            .find({parentCommentId})
            .sort({createdAt: -1}))
            .map(c => c.toObject());
        const promises = parents.map(async p => {
            p.childComments = await this.getByParentId(p._id);
        });
        await Promise.all(promises);
        return parents;
    }

    getCountByPostId = async (postId: string) => {
        return await this.comments.countDocuments({postId});
    }

    getById = async (_id: string) => {
        const comment = await this.comments.findById(_id);
        return comment||undefined;
    }
}