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

    getPostsByUserName = async (userName: string, notForCloseFriends: boolean, skip: number, limit: number): Promise<Post[]> => {
        let posts: Post[]  = [];
        if (notForCloseFriends) {
            posts = (await this.posts.find({userName, forCloseFriends: false})
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1}))
            .map(p => p.toObject());
        } else {
            posts = (await this.posts.find({userName})
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1}))
            .map(p => p.toObject());
        }
        return posts;
    }

    getPostCount = async (userName: string, notForCloseFriends: boolean) => {
        let count: number;
        if (notForCloseFriends) {
            count = await this.posts.countDocuments({userName, forCloseFriends: false});
        } else {
            count = await this.posts.countDocuments({userName});
        }
        return count;
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

    getExplorePosts = async (closeFriendsList: string[], followingsList: string[], skip: number, limit: number) => {
        const posts = await this.posts.find({$or:[
            {userName: {$in: followingsList}, forCloseFriends: false},
            {userName: {$in: closeFriendsList}, forCloseFriends: true}
        ]})
        .skip(skip)
        .limit(limit)
        .sort({creationDate: -1})
        .lean();
        return posts;
    }
}