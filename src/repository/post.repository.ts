import { Model } from "mongoose";
import {postSchema} from "../models/post/post-schema";
import {IPost, Post, PostDto} from "../models/post/post";
import { PostRequest } from "../models/post/post-request";
import { EditPostRequest } from "../models/post/edit-post-request";

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

    getPostsByUserName = async (userName: string): Promise<Post[]> => {
        const posts: Post[] = (await this.posts.find({userName})).map(p => p.toObject());
        return posts;
    }

    getPostCount = async (userName: string) => {
        return await this.posts.countDocuments({userName});
    }

    update = async (editPostRequest: EditPostRequest) => {
        const result = await this.posts.updateOne({_id: editPostRequest._id}, editPostRequest);
        return result.acknowledged;
    }

    getPostById = async (_id: string): Promise<Post|undefined> => {
        const post = await this.posts.findById(_id);
        if (!post) {
            return;
        }
        return post.toObject();
    }
}