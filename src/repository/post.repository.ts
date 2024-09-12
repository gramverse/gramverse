import {Model} from "mongoose";
import {postSchema} from "../models/post/post-schema";
import {IPost, Post, PostDto} from "../models/post/post";
import {PostRequest} from "../models/post/post-request";
import {EditPostRequest} from "../models/post/edit-post-request";
import {convertType, convertTypeForArray} from "../utilities/convert-type";

export class PostRepository {
    private posts: Model<IPost>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.posts = dataHandler.model<IPost>("posts", postSchema);
    }

    add = async (postRequest: PostRequest) => {
        const createdPost = await this.posts.create(postRequest);
        return createdPost._id;
    };

    getPostsByUserName = async (
        userName: string,
        forCloseFriends: boolean,
        skip: number,
        limit: number,
    ): Promise<Post[]> => {
        let posts: Post[] = [];
        if (!forCloseFriends) {
            posts = await this.posts
                .find({userName, forCloseFriends: false})
                .skip(skip)
                .limit(limit)
                .sort({creationDate: -1})
                .lean();
        } else {
            posts = await this.posts
                .find({userName})
                .skip(skip)
                .limit(limit)
                .sort({creationDate: -1})
                .lean();
        }
        return posts;
    };

    getPostCount = async (userName: string, forCloseFriends: boolean) => {
        let count: number;
        if (!forCloseFriends) {
            count = await this.posts.countDocuments({
                userName,
                forCloseFriends: false,
            });
        } else {
            count = await this.posts.countDocuments({userName});
        }
        return count;
    };

    update = async (editPostRequest: EditPostRequest) => {
        await this.posts.updateOne({_id: editPostRequest._id}, editPostRequest);
    };

    getPostById = async (_id: string): Promise<Post | undefined> => {
        const post = await this.posts.findById(_id);
        return post?.toObject();
    };

    getExplorePosts = async (
        closeFriendsList: string[],
        followingsList: string[],
        skip: number,
        limit: number,
    ) => {
        const posts = await this.posts
            .find({
                $or: [
                    {userName: {$in: followingsList}, forCloseFriends: false},
                    {userName: {$in: closeFriendsList}, forCloseFriends: true},
                ],
            })
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
        return posts;
    };

    getExplorePostCount = async (
        closeFriendsList: string[],
        followingsList: string[],
    ) => {
        return await this.posts.countDocuments({
            $or: [
                {userName: {$in: followingsList}, forCloseFriends: false},
                {userName: {$in: closeFriendsList}, forCloseFriends: true},
            ],
        });
    };

    getPostUserName = async (postId: string) => {
        const userName = await this.posts.findById(postId);
        return userName;
    };

    updateLikesCount = async (_id: string, likesCount: number) => {
        await this.posts.updateOne({_id}, {likesCount});
    };

    getAllPosts = async () => {
        return await this.posts.find();
    };
}
