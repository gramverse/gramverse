import {
    ForbiddenError,
    UnknownError,
    ValidationError,
} from "../errors/http-error";
import {EditPostRequest} from "../models/post/edit-post-request";
import {PostRequest} from "../models/post/post-request";
import {FollowRepService} from "./follow.rep.service";
import {PostRepository} from "../repository/post.repository";
import {UserRepService} from "./user.rep.service";
import {FollowRequestState} from "../models/follow/follow-request-state";

export class PostRepService {
    constructor(
        private userRepService: UserRepService,
        private followRepService: FollowRepService,
        private postRepository: PostRepository,
    ) {}

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
        await this.postRepository.update(editPostRequest);
    };

    checkPostAccess = async (userName: string, postId: string) => {
        const post = await this.getPostById(postId);
        if (!post) {
            throw new ValidationError("postId");
        }
        if (userName == post.userName) {
            return;
        }
        const visitorFollow = await this.followRepService.getFollow(
            userName,
            post.userName,
        );
        const creatorFollow = await this.followRepService.getFollow(
            post.userName,
            userName,
        );
        if (visitorFollow && visitorFollow.isBlocked) {
            throw new ForbiddenError("User is blocked by you");
        }
        if (creatorFollow && creatorFollow.isBlocked) {
            throw new ForbiddenError("You are blocked");
        }
        const creatorUser = await this.userRepService.getUser(post.userName);
        if (!creatorUser) {
            throw new UnknownError();
        }
        if (
            creatorUser.isPrivate &&
            (!visitorFollow ||
                visitorFollow.followRequestState != FollowRequestState.ACCEPTED)
        ) {
            throw new ForbiddenError("User is private");
        }
    };

    updateLikesCount = async (postId: string, likesCount: number) => {
        await this.postRepository.updateLikesCount(postId, likesCount);
    }

    getAllPosts = async () => {
        return await this.postRepository.getAllPosts();
    }
}
