import { Model } from "mongoose";
import {postSchema} from "../models/post-schema";
import {IPost, Post} from "../models/post-response";
import { PostRequest } from "../models/post-request";

export class PostRepository {
    private posts: Model<IPost>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.posts = dataHandler.model<IPost>("posts", postSchema);
    }

    add = async (postRequest: PostRequest) => {
        const createdPost = await this.posts.create(postRequest);
        if (!createdPost) {
            return undefined;
        }
        const newPost: Post = createdPost;
        return newPost;
    }
    getPostsByUserName = async (userName : string) => {
        const posts = await this.posts.find({userName});
        return posts.map(p => p.toObject());

    }

    getPostCount = async (userName: string) => {
        return await this.posts.countDocuments({userName});
    }


}