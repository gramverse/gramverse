import {PostRequest} from "../models/post/post-request";
import {Post} from "../models/post/post";
import {UserRepository} from "../repository/user.repository";
import {TagRepository} from "../repository/tag.repository";
import {BookmarkRepository} from "../repository/bookmark.repository";
import {LikesRepository} from "../repository/like.repository";
import {FollowRepService} from "./follow.rep.service";
import {Tag} from "../models/tag/tag";
import {PostDto} from "../models/post/post-dto";
import {PostDetailDto} from "../models/post/post-detail-dto";
import {
    ForbiddenError,
    HttpError,
    NotFoundError,
    UnknownError,
    ValidationError,
} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import {EditPostRequest} from "../models/post/edit-post-request";
import {TagRequest} from "../models/tag/tag-request";
import {LikeDto, LikeRequest} from "../models/like/like-request";
import {
    CommentsLikeRequest,
    zodCommentslikeRequest,
    CommentsLikeDto,
} from "../models/commentslike/commentslike-request";
import {CommentRequest} from "../models/comment/comment-request";
import {
    BookmarkDto,
    BookmarkRequest,
} from "../models/bookmark/bookmark-request";
import {
    forEachChild,
    getModeForFileReference,
    hasRestParameter,
} from "typescript";
import {FollowRequestState} from "../models/follow/follow-request-state";
import {ExplorePostDto} from "../models/post/explore-post-dto";
import {FollowService} from "./follow.service";
import {userService} from "../config";
import {NotificationRepository} from "../repository/notification.repository";
import {NotificationService} from "./notification.service";
import {PostRepService} from "./post.rep.service";
import {UserRepService} from "./user.rep.service";
import {CommentService} from "./comment.service";
import {CommentRepService} from "./comment.rep.service";
import {MentionsRepository} from "../repository/mentions.repository";
import {MentionDto} from "../models/mention/mention-request";

export class PostService {
    constructor(
        private followRepService: FollowRepService,
        private postRepService: PostRepService,
        private userRepService: UserRepService,
        private notificationService: NotificationService,
        private commentRepService: CommentRepService,
        private tagRepository: TagRepository,
        private likesRepository: LikesRepository,
        private bookmarkRepository: BookmarkRepository,
        private mentionRepository: MentionsRepository,
    ) {}

    extractHashtags = (text: string) => {
        const regex = /#([\u0600-\u06FF\w]+)/g;

        const matches = text.match(regex);

        return matches
            ? Array.from(new Set(matches.map((tag) => tag.slice(1))))
            : [];
    };

    checkMentions = async (
        myUserName: string,
        oldMentions: string[],
        newMentions: string[],
    ) => {
        const mentionsToBeRemoved = oldMentions.filter(
            (m) => !newMentions.includes(m),
        );
        const mentionsToBeAdded = newMentions.filter(
            (m) => !oldMentions.includes(m),
        );
        for (const mention of mentionsToBeAdded) {
            await this.checkMentionAccess(myUserName, mention);
        }
    };

    updateMentions = async (
        myUserName: string,
        postId: string,
        oldMentions: string[],
        newMentions: string[],
    ) => {
        const mentionsToBeRemoved = oldMentions.filter(
            (m) => !newMentions.includes(m),
        );
        const mentionsToBeAdded = newMentions.filter(
            (m) => !oldMentions.includes(m),
        );
        for (const mention of mentionsToBeAdded) {
            const existingMention = await this.mentionRepository.getMention(
                mention,
                postId,
            );
            if (existingMention) {
                this.mentionRepository.undeleteMention(mention, postId);
            } else {
                const mentionDto: MentionDto = {
                    userName: mention,
                    postId: postId,
                    isDeleted: false,
                };
                this.mentionRepository.add(mentionDto);
            }
            this.notificationService.addMention(myUserName, mention, postId);
        }
        for (const mention of mentionsToBeRemoved) {
            const existingMention = await this.mentionRepository.getMention(
                mention,
                postId,
            );
            if (existingMention) {
                this.mentionRepository.deleteMention(mention, postId);
            }
            this.notificationService.deleteNotification(myUserName, mention);
        }
    };

    addPost = async (postRequest: PostRequest) => {
        if (postRequest.photoUrls.length == 0) {
            throw new HttpError(
                400,
                ErrorCode.MISSING_PHOTO_FOR_POST,
                "Missing photo for post",
            );
        }
        if (postRequest.photoUrls.length > 10) {
            throw new HttpError(
                400,
                ErrorCode.PHOTO_COUNT_EXCEDED,
                "Maximum photo count = 10",
            );
        }
        await this.checkMentions(
            postRequest.userName,
            [],
            postRequest.mentions,
        );
        const createdPost = await this.postRepService.createPost(postRequest);
        const tags: Array<string> = this.extractHashtags(postRequest.caption);
        tags.forEach(async (t) => {
            const newTagRequest: TagRequest = {
                postId: createdPost,
                tag: t,
                isDeleted: false,
            };
            await this.tagRepository.add(newTagRequest);
        });
        await this.updateMentions(
            postRequest.userName,
            createdPost,
            [],
            postRequest.mentions,
        );
    };

    editPost = async (editPostRequest: EditPostRequest, userName: string) => {
        const post = await this.postRepService.getPostById(editPostRequest._id);
        if (!post) {
            throw new NotFoundError("post");
        }
        if (post.userName != userName) {
            throw new ForbiddenError("Edit post access denied");
        }
        if (editPostRequest.photoUrls.length < 1) {
            throw new HttpError(
                400,
                ErrorCode.MISSING_PHOTO_FOR_POST,
                "Missing photo for post",
            );
        }
        if (editPostRequest.photoUrls.length > 10) {
            throw new HttpError(
                400,
                ErrorCode.PHOTO_COUNT_EXCEDED,
                "Maximum photo count = 10",
            );
        }
        await this.checkMentions(
            editPostRequest.userName,
            post.mentions,
            editPostRequest.mentions,
        );
        const postTags = await this.tagRepository.findPostTags(
            editPostRequest._id,
        );
        const oldTags = postTags.filter((t) => !t.isDeleted);
        const newTags = this.extractHashtags(editPostRequest.caption);
        const tagsToBeDeleted = oldTags.filter((t) => !newTags.includes(t.tag));
        const tagsToBeAdded = newTags.filter(
            (t) => !oldTags.find((T) => T.tag == t),
        );
        tagsToBeDeleted.forEach(async (t) => {
            await this.tagRepository.deleteTag(t._id);
        });
        tagsToBeAdded.forEach(async (t) => {
            const deletedTag = postTags.find((tag) => tag.tag == t);
            if (deletedTag) {
                await this.tagRepository.undeleteTag(deletedTag._id);
            } else {
                const newTagRequest: TagRequest = {
                    postId: editPostRequest._id,
                    tag: t,
                    isDeleted: false,
                };
                await this.tagRepository.add(newTagRequest);
            }
        });
        await this.postRepService.updatePost(editPostRequest);
        await this.updateMentions(
            editPostRequest.userName,
            editPostRequest._id,
            post.mentions,
            editPostRequest.mentions,
        );
    };

    getPosts = async (
        userName: string,
        myUserName: string,
        page: number,
        limit: number,
    ) => {
        await this.followRepService.checkUserAccess(myUserName, userName);
        const skip = (page - 1) * limit;
        let forCloseFriends: boolean;
        if (userName == myUserName) {
            forCloseFriends = true;
        } else {
            const follow = await this.followRepService.getFollow(
                userName,
                myUserName,
            );
            forCloseFriends = !follow || !follow.isCloseFriend ? false : true;
        }
        const posts = await this.postRepService.getPostsByUserName(
            userName,
            forCloseFriends,
            page,
            limit,
        );
        const totalCount = await this.postRepService.getPostCount(
            userName,
            forCloseFriends,
        );
        const postDtos: PostDto[] = [];
        posts.forEach((p) => {
            const postDto: PostDto = {
                ...p,
                tags: this.extractHashtags(p.caption),
            };
            postDtos.push(postDto);
        });
        return {posts: postDtos, totalCount};
    };

    getPostDto = async (userName: string, post: Post) => {
        const tags = this.extractHashtags(post.caption);
        const commentsCount = await this.commentRepService.getCountByPostId(
            post._id,
        );
        const bookmarksCount = await this.bookmarkRepository.getCountByPostId(
            post._id,
        );
        const isLiked = await this.likesRepository.likeExists(
            userName,
            post._id,
        );
        const isBookmarked = await this.bookmarkRepository.bookmarkExists(
            userName,
            post._id,
        );
        const postDetailDto: PostDetailDto = {
            ...post,
            tags,
            commentsCount,
            bookmarksCount,
            isLiked,
            isBookmarked,
        };
        return postDetailDto;
    };

    getPostById = async (_id: string, userName: string) => {
        await this.postRepService.checkPostAccess(userName, _id);
        const post = await this.postRepService.getPostById(_id);
        if (!post) {
            throw new NotFoundError("post");
        }
        return await this.getPostDto(userName, post);
    };

    likePost = async (likeRequest: LikeRequest) => {
        await this.postRepService.checkPostAccess(
            likeRequest.userName,
            likeRequest.postId,
        );
        const existingLike = await this.likesRepository.getLike(
            likeRequest.userName,
            likeRequest.postId,
        );
        if (existingLike) {
            if (!existingLike.isDeleted) {
                this.notificationService.addLike(
                    likeRequest.userName,
                    likeRequest.postId,
                );
                return;
            }
            await this.likesRepository.undeleteLike(
                likeRequest.userName,
                likeRequest.postId,
            );
            await this.updateLikesCount(likeRequest.postId);
            return;
        }
        const likeDto: LikeDto = {
            userName: likeRequest.userName,
            postId: likeRequest.postId,
            isDeleted: false,
        };
        await this.likesRepository.add(likeDto);
        await this.updateLikesCount(likeRequest.postId);
        this.notificationService.addLike(
            likeRequest.userName,
            likeRequest.postId,
        );
    };

    unlikePost = async (likeRequest: LikeRequest) => {
        await this.postRepService.checkPostAccess(
            likeRequest.userName,
            likeRequest.postId,
        );
        const likeDto: LikeDto = {
            userName: likeRequest.userName,
            postId: likeRequest.postId,
            isDeleted: true,
        };
        const existingLike = await this.likesRepository.getLike(
            likeRequest.userName,
            likeRequest.postId,
        );
        if (!existingLike || existingLike.isDeleted) {
            this.notificationService.deleteNotification(
                likeRequest.userName,
                likeRequest.postId,
            );
            return;
        }
        await this.likesRepository.deleteLike(
            likeRequest.userName,
            likeRequest.postId,
        );
        await this.updateLikesCount(likeRequest.postId);
        this.notificationService.deleteNotification(
            likeRequest.userName,
            likeRequest.postId,
        );
    };

    bookmark = async (bookmarkRequest: BookmarkRequest) => {
        await this.postRepService.checkPostAccess(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        const existingBookmark = await this.bookmarkRepository.getBookmark(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        if (existingBookmark) {
            if (!existingBookmark.isDeleted) {
                return true;
            }
            await this.bookmarkRepository.undeleteBookmark(
                bookmarkRequest.userName,
                bookmarkRequest.postId,
            );
            return;
        }
        const bookmarkDto: BookmarkDto = {
            userName: bookmarkRequest.userName,
            postId: bookmarkRequest.postId,
            isDeleted: false,
        };
        await this.bookmarkRepository.add(bookmarkDto);
    };

    unbookmark = async (bookmarkRequest: BookmarkRequest) => {
        await this.postRepService.checkPostAccess(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        const existingBookmark = await this.bookmarkRepository.getBookmark(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        if (!existingBookmark || existingBookmark.isDeleted) {
            return;
        }
        await this.bookmarkRepository.deleteBookmark(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
    };

    checkMentionAccess = async (mentioner: string, mentioned: string) => {
        if (mentioner == mentioned) {
            return;
        }
        const mentionerFollow = await this.followRepService.getFollow(
            mentioner,
            mentioned,
        );
        const mentionedFollow = await this.followRepService.getFollow(
            mentioned,
            mentioner,
        );
        if (mentionerFollow && mentionerFollow.isBlocked) {
            throw new ForbiddenError("User is blocked by you");
        }
        if (mentionedFollow && mentionedFollow.isBlocked) {
            throw new ForbiddenError("You are blocked");
        }
        const mentionedUser = await this.userRepService.getUser(mentioned);
        if (!mentionedUser) {
            throw new UnknownError();
        }
    };

    getExplorePosts = async (userName: string, page: number, limit: number) => {
        const allFollows =
            await this.followRepService.getAllFollowings(userName);
        const followingsList = allFollows.map((f) => f.followingUserName);
        const closeFriendsList = allFollows
            .filter((f) => f.isCloseFriend)
            .map((f) => f.followingUserName);
        const posts = await this.postRepService.getExplorePosts(
            closeFriendsList,
            followingsList,
            page,
            limit,
        );
        const totalCount = await this.postRepService.getExplorePostCount(
            closeFriendsList,
            followingsList,
        );
        const postDtos: ExplorePostDto[] = [];
        for (const p of posts) {
            const postDto = await this.getPostDto(userName, p);
            const user = await this.userRepService.getUser(p.userName);
            if (!user) {
                throw new UnknownError();
            }
            const {profileImage} = user;
            const followerCount = await this.followRepService.getFollowerCount(
                p.userName,
            );
            const explorePostDto: ExplorePostDto = {
                ...postDto,
                profileImage,
                followerCount,
            };
            postDtos.push(explorePostDto);
        }
        return {postDtos, totalCount};
    };
    getMyBookMarks = async (userName: string, page: number, limit: number) => {
        const skip = (page - 1) * limit;
        const totalCount =
            await this.bookmarkRepository.getCountBookmarks(userName);
        const postIds = await this.bookmarkRepository.getBookmarks(
            userName,
            skip,
            limit,
        );

        const posts = [];

        for (const postId of postIds) {
            const hasAccess =
                await this.notificationService.checkPostAccessForNotification(
                    userName,
                    postId,
                );

            if (hasAccess) {
                const post = await this.postRepService.getPostById(postId);
                if (post) {
                    posts.push({
                        photoUrl: post.photoUrls[0],
                        postId: post._id,
                        userName: post.userName
                    });
                }
            }
        }

        return {
            posts,
            totalCount,
        };
    };

    updateLikesCount = async (postId: string) => {
        const likesCount = await this.likesRepository.getCountByPostId(postId);
        await this.postRepService.updateLikesCount(postId, likesCount);
    };

    updateAllPosts = async () => {
        const allPosts = await this.postRepService.getAllPosts();
        let counter = 0;
        for (const post of allPosts) {
            await this.updateLikesCount(post._id);
            counter++;
        }
        return `Number of updated posts: ${counter}`;
    };
    getMyMentions = async (userName: string, page: number, limit: number) => {
        const skip = (page - 1) * limit;
        const totalCount =
            await this.mentionRepository.getCountMentions(userName);
        const postIds = await this.mentionRepository.getMentions(
            userName,
            skip,
            limit,
        );

        const posts = [];

        for (const postId of postIds) {
            const hasAccess =
                await this.notificationService.checkPostAccessForNotification(
                    userName,
                    postId,
                );
            if (hasAccess) {
                const post = await this.postRepService.getPostById(postId);
                if (post) {
                    posts.push({
                        photoUrl: post.photoUrls[0],
                        postId: post._id,
                        userName: post.userName,
                    });
                }
            }
        }
        return {
            posts,
            totalCount,
        };
    };
}
