import { Model } from "mongoose";
import {postSchema} from "../models/post-schema";

export class PostRepository {
    private posts: Model<IPost>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.posts = dataHandler.model("posts", postSchema);
    }

    add = async (post: Post) => {
        const createdPost = await this.posts.create(post);
        if (!createdPost) {
            return undefined;
        }
        const newPost: Post = createdPost;
        return newPost;
    }
}