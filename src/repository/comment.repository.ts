import {Model} from "mongoose";
import {commentSchema} from "../models/comment/comment-schema";
import {IComment, Comment} from "../models/comment/comment";
import {CommentRequest} from "../models/comment/comment-request";
import { convertType, convertTypeForArray } from "../utilities/convert-type";

export class CommentRepository {
    private comments: Model<IComment>;
    constructor(private datahandler: typeof import("mongoose")) {
        this.comments = datahandler.model<IComment>("comments", commentSchema);
    }
    add = async (commentRequest: CommentRequest) => {
        const createdComment = await this.comments.create(commentRequest);
        return createdComment._id;
    };

    getByPostId = async (
        postId: string,
        skip: number,
        limit: number,
    ): Promise<Comment[]> => {
        const parents: Comment[] = (
            await this.comments
                .find({postId, parentCommentId: ""})
                .skip(skip)
                .limit(limit)
                .sort({creationDate: -1})
        ).map((c) => c.toObject());
        for (const parent of parents) {
            parent.childComments = await this.getByParentId(parent._id);
        }
        return parents;
    };

    getByParentId = async (parentCommentId: string) => {
        const parents: Comment[] = (
            await this.comments.find({parentCommentId}).sort({creationDate: -1})
        ).map((c) => c.toObject());
        for (const parent of parents) {
            parent.childComments = await this.getByParentId(parent._id);
        }
        return parents;
    };

    getCountByPostId = async (postId: string) => {
        return await this.comments.countDocuments({postId});
    };

    getRootCountByPostId = async (postId: string) => {
        return await this.comments.countDocuments({
            postId,
            parentCommentId: "",
        });
    };

    getById = async (_id: string) => {
        const comment = await this.comments.findById(_id);
        return convertType<Comment, IComment>(comment);
    };
}
