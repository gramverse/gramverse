import {EditPostRequest} from "../models/post/edit-post-request";
import {PostRequest} from "../models/post/post-request";
import {PostRepository} from "../repository/post.repository";

export class PostRepService {
    constructor(private postRepository: PostRepository) {}

    createPost = async (postRequest: PostRequest) => {
        return await this.postRepository.add(postRequest);
    };

    getPostById = async (_id: string) => {
        return await this.postRepository.getPostById(_id);
    };

    getPostsByUserName = async (
        userName: string,
        forCloseFriends: boolean,
        page: number,
        limit: number,
    ) => {
        const skip = (page - 1) * limit;
        return await this.postRepository.getPostsByUserName(
            userName,
            forCloseFriends,
            skip,
            limit,
        );
    };

    getPostCount = async (userName: string, forCloseFriends: boolean) => {
        return await this.postRepository.getPostCount(
            userName,
            forCloseFriends,
        );
    };

    getExplorePosts = async (
        closeFriendsList: string[],
        followingsList: string[],
        page: number,
        limit: number,
    ) => {
        const skip = (page - 1) * limit;
        return await this.postRepository.getExplorePosts(
            closeFriendsList,
            followingsList,
            skip,
            limit,
        );
    };

    getExplorePostCount = async (
        closeFriendsList: string[],
        followingsList: string[],
    ) => {
        return await this.postRepository.getExplorePostCount(
            closeFriendsList,
            followingsList,
        );
    };

    updatePost = async (editPostRequest: EditPostRequest) => {
        return await this.postRepository.update(editPostRequest);
    };
}
