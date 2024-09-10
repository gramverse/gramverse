import {PostRequest} from "../models/post/post-request";
import {Post} from "../models/post/post";
import {UserRepository} from "../repository/user.repository";
import {TagRepository} from "../repository/tag.repository";
import {CommentRepository} from "../repository/comment.repository";
import {BookmarksRepository} from "../repository/bookmarks.repository";
import {LikesRepository} from "../repository/likes.repository";
import {CommentslikeRepository} from "../repository/commentslike.repository";
import {FollowRepService} from "./follow.rep.service";
import {Tag} from "../models/tag/tag";
import {PostDto} from "../models/post/post-dto";
import {PostDetailDto} from "../models/post/post-detail-dto";
import {HttpError} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import {EditPostRequest} from "../models/post/edit-post-request";
import {TagRequest} from "../models/tag/tag-request";
import {CommentDto} from "../models/comment/comment-dto";
import {Comment} from "../models/comment/comment";
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
import {UserRepService} from "./userRep.service";

export class PostService {
    constructor(
        private followRepService: FollowRepService,
        private postRepService: PostRepService,
        private userRepService: UserRepService,
        private tagRepository: TagRepository,
        private commentRepository: CommentRepository,
        private bookmarksRepository: BookmarksRepository,
        private likesRepository: LikesRepository,
        private commentslikeRepository: CommentslikeRepository,
        private bookmarkRepository: BookmarksRepository,
        private notificationService: NotificationService,
    ) {}

    extractHashtags = (text: string) => {
        const regex = /#[\w]+/g;

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
            this.notificationService.addMention(myUserName, mention, postId);
        }
        for (const mention of mentionsToBeRemoved) {
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
        if (!createdPost) {
            return;
        }
        const tags: Array<string> = this.extractHashtags(createdPost.caption);
        tags.forEach(async (t) => {
            const newTagRequest: TagRequest = {
                postId: createdPost._id,
                tag: t,
                isDeleted: false,
            };
            await this.tagRepository.add(newTagRequest);
        });
        await this.updateMentions(
            postRequest.userName,
            createdPost._id,
            [],
            postRequest.mentions,
        );
        return createdPost;
    };

    editPost = async (editPostRequest: EditPostRequest, userName: string) => {
        const post = await this.postRepService.getPostById(editPostRequest._id);
        if (!post) {
            throw new HttpError(
                404,
                ErrorCode.POST_NOT_FOUND,
                "Post not found",
            );
        }
        if (post.userName != userName) {
            throw new HttpError(
                403,
                ErrorCode.EDIT_POST_ACCESS_DENIED,
                "Only post creator can edit post",
            );
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
        const success = await this.postRepService.updatePost(editPostRequest);
        if (!success) {
            return;
        }
        const updatedPost = await this.postRepService.getPostById(
            editPostRequest._id,
        );
        if (!updatedPost) {
            return;
        }
        const postDto: PostDto = {
            ...updatedPost,
            tags: newTags,
        };
        await this.updateMentions(
            editPostRequest.userName,
            editPostRequest._id,
            post.mentions,
            editPostRequest.mentions,
        );
        return postDto;
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

    getCommentDto = async (
        requestUserName: string,
        parentCommentUserName: string,
        comment: Comment,
    ) => {
        const {
            _id,
            userName,
            postId,
            comment: commentText,
            parentCommentId,
            creationDate,
        } = comment;
        const commentDto: CommentDto = {
            _id,
            userName,
            postId,
            comment: commentText,
            parentCommentId,
            parentCommentUserName,
            creationDate,
            isLiked: await this.commentslikeRepository.commentslikeExists(
                requestUserName,
                comment._id,
            ),
            likesCount: await this.commentslikeRepository.getCountByCommentId(
                comment._id,
            ),
            childDtos: [],
        };
        for (const c of comment.childComments) {
            commentDto.childDtos.push(
                await this.getCommentDto(requestUserName, comment.userName, c),
            );
        }
        return commentDto;
    };

    getComments = async (
        userName: string,
        postId: string,
        page: number,
        limit: number,
    ) => {
        await this.checkPostAccess(userName, postId);
        const skip = (page - 1) * limit;
        const parentComments = await this.commentRepository.getByPostId(
            postId,
            skip,
            limit,
        );
        const allDtos: CommentDto[] = [];
        for (const c of parentComments) {
            const dto: CommentDto = await this.getCommentDto(userName, "", c);
            allDtos.push(dto);
        }
        const commentsCount =
            await this.commentRepository.getRootCountByPostId(postId);
        return {comments: allDtos, totalCount: commentsCount};
    };

    getPostDto = async (userName: string, post: Post) => {
        const tags = this.extractHashtags(post.caption);
        const commentsCount = await this.commentRepository.getCountByPostId(
            post._id,
        );
        const likesCount = await this.likesRepository.getCountByPostId(
            post._id,
        );
        const bookmarksCount = await this.bookmarksRepository.getCountByPostId(
            post._id,
        );
        const isLiked = await this.likesRepository.likeExists(
            userName,
            post._id,
        );
        const isBookmarked = await this.bookmarksRepository.bookmarkExists(
            userName,
            post._id,
        );
        const postDetailDto: PostDetailDto = {
            ...post,
            tags,
            commentsCount,
            likesCount,
            bookmarksCount,
            isLiked,
            isBookmarked,
        };
        return postDetailDto;
    };

    getPostById = async (_id: string, userName: string) => {
        await this.checkPostAccess(userName, _id);
        const post = await this.postRepService.getPostById(_id);
        if (!post) {
            return;
        }
        return await this.getPostDto(userName, post);
    };

    likePost = async (likeRequest: LikeRequest) => {
        await this.checkPostAccess(likeRequest.userName, likeRequest.postId);
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
                return true;
            }
            const undeleteResult = await this.likesRepository.undeleteLike(
                likeRequest.userName,
                likeRequest.postId,
            );
            if (undeleteResult) {
                return true;
            }
            return false;
        }
        const likeDto: LikeDto = {
            userName: likeRequest.userName,
            postId: likeRequest.postId,
            isDeleted: false,
        };
        const insertDto = await this.likesRepository.add(likeDto);
        if (!insertDto) {
            throw new HttpError(
                500,
                ErrorCode.UNKNOWN_ERROR,
                "Unknown problem occurred",
            );
        }
        this.notificationService.addLike(
            likeRequest.userName,
            likeRequest.postId,
        );
        return true;
    };

    unlikePost = async (likeRequest: LikeRequest) => {
        await this.checkPostAccess(likeRequest.userName, likeRequest.postId);
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
            return true;
        }
        const deleteResult = await this.likesRepository.deleteLike(
            likeRequest.userName,
            likeRequest.postId,
        );
        if (!deleteResult) {
            return false;
        }

        this.notificationService.deleteNotification(
            likeRequest.userName,
            likeRequest.postId,
        );
        return true;
    };

    likeComment = async (commentslikeRequest: CommentsLikeRequest) => {
        const comment = await this.commentRepository.getById(
            commentslikeRequest.commentId,
        );
        if (!comment) {
            throw new HttpError(
                404,
                ErrorCode.COMMENT_NOT_FOUND,
                "Comment not found",
            );
        }
        await this.checkPostAccess(
            commentslikeRequest.userName,
            comment.postId,
        );
        const existingCommentsLike =
            await this.commentslikeRepository.getCommentsLike(
                commentslikeRequest.userName,
                commentslikeRequest.commentId,
            );
        if (existingCommentsLike) {
            if (!existingCommentsLike.isDeleted) {
                return true;
            }
            const undeleteResult =
                await this.commentslikeRepository.undeleteCommentsLike(
                    commentslikeRequest.userName,
                    commentslikeRequest.commentId,
                );
            if (undeleteResult) {
                return true;
            }
            return false;
        }
        const commentsLikeDto: CommentsLikeDto = {
            userName: commentslikeRequest.userName,
            commentId: commentslikeRequest.commentId,
            isDeleted: false,
        };
        const insertDto =
            await this.commentslikeRepository.add(commentsLikeDto);
        if (!insertDto) {
            throw new HttpError(
                500,
                ErrorCode.UNKNOWN_ERROR,
                "Unknown problem occurred",
            );
        }
        return true;
    };

    unlikeComment = async (commentslikeRequest: CommentsLikeRequest) => {
        const comment = await this.commentRepository.getById(
            commentslikeRequest.commentId,
        );
        if (!comment) {
            throw new HttpError(
                404,
                ErrorCode.COMMENT_NOT_FOUND,
                "Comment not found",
            );
        }
        await this.checkPostAccess(
            commentslikeRequest.userName,
            comment.postId,
        );
        const existingCommentsLike =
            await this.commentslikeRepository.getCommentsLike(
                commentslikeRequest.userName,
                commentslikeRequest.commentId,
            );
        if (!existingCommentsLike || existingCommentsLike.isDeleted) {
            return true;
        }
        const deleteResult =
            await this.commentslikeRepository.deleteCommentsLike(
                commentslikeRequest.userName,
                commentslikeRequest.commentId,
            );
        if (!deleteResult) {
            return false;
        }
        return true;
    };

    addComment = async (commentRequest: CommentRequest) => {
        if (
            commentRequest.parentCommentId != "" &&
            !(await this.commentRepository.getById(
                commentRequest.parentCommentId,
            ))
        ) {
            throw new HttpError(
                400,
                ErrorCode.COMMENT_INVALID_PARENT_ID,
                "Parent comment doesn't exist",
            );
        }
        await this.checkPostAccess(
            commentRequest.userName,
            commentRequest.postId,
        );
        const createdComment = await this.commentRepository.add(commentRequest);
        if (createdComment) {
            this.notificationService.addComment(
                commentRequest.userName,
                createdComment._id,
            );
        }
        return createdComment || undefined;
    };

    bookmark = async (bookmarkRequest: BookmarkRequest) => {
        await this.checkPostAccess(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        const existingBookmark = await this.bookmarksRepository.getBookmark(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        if (existingBookmark) {
            if (!existingBookmark.isDeleted) {
                return true;
            }
            const undeleteResult =
                await this.bookmarksRepository.undeleteBookmark(
                    bookmarkRequest.userName,
                    bookmarkRequest.postId,
                );
            if (undeleteResult) {
                return true;
            }
            return false;
        }
        const bookmarkDto: BookmarkDto = {
            userName: bookmarkRequest.userName,
            postId: bookmarkRequest.postId,
            isDeleted: false,
        };
        const insertDto = await this.bookmarksRepository.add(bookmarkDto);
        if (!insertDto) {
            throw new HttpError(
                500,
                ErrorCode.UNKNOWN_ERROR,
                "Unknown problem occurred",
            );
        }
        return true;
    };

    unbookmark = async (bookmarkRequest: BookmarkRequest) => {
        await this.checkPostAccess(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        const existingBookmark = await this.bookmarksRepository.getBookmark(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        if (!existingBookmark || existingBookmark.isDeleted) {
            return true;
        }
        const deleteResult = await this.bookmarksRepository.deleteBookmark(
            bookmarkRequest.userName,
            bookmarkRequest.postId,
        );
        if (!deleteResult) {
            return false;
        }
        return true;
    };

    checkPostAccess = async (userName: string, postId: string) => {
        const post = await this.postRepService.getPostById(postId);
        if (!post) {
            throw new HttpError(
                400,
                ErrorCode.INVALID_POST_ID,
                "Post doesn't exist",
            );
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
            throw new HttpError(
                403,
                ErrorCode.CREATOR_IS_BLOCKED_BY_YOU,
                "You have blocked this user",
            );
        }
        if (creatorFollow && creatorFollow.isBlocked) {
            throw new HttpError(
                403,
                ErrorCode.YOU_ARE_BLOCKED,
                "This user has blocked you",
            );
        }
        const creatorUser = await this.userRepService.getUser(post.userName);
        if (!creatorUser) {
            throw new HttpError(
                500,
                ErrorCode.UNKNOWN_ERROR,
                "post username doesn't exist in users",
            );
        }
        if (
            creatorUser.isPrivate &&
            (!visitorFollow ||
                visitorFollow.followRequestState != FollowRequestState.ACCEPTED)
        ) {
            throw new HttpError(
                403,
                ErrorCode.USER_IS_PRIVATE,
                "User is private",
            );
        }
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
            throw new HttpError(
                403,
                ErrorCode.CREATOR_IS_BLOCKED_BY_YOU,
                "You have blocked this user",
            );
        }
        if (mentionedFollow && mentionedFollow.isBlocked) {
            throw new HttpError(
                403,
                ErrorCode.YOU_ARE_BLOCKED,
                "This user has blocked you",
            );
        }
        const mentionedUser = await this.userRepService.getUser(mentioned);
        if (!mentionedUser) {
            throw new HttpError(
                500,
                ErrorCode.UNKNOWN_ERROR,
                "post username doesn't exist in users",
            );
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
                throw new HttpError(
                    500,
                    ErrorCode.UNKNOWN_ERROR,
                    "Unknown error",
                );
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
    }
    getMyBookMarks = async (userName: string, page: number, limit: number) => {
        const skip = (page - 1) * limit;
        const totalCount = await this.bookmarkRepository.getCountBookmarks(userName);
        const postIds = await this.bookmarksRepository.getBookmarks(userName, skip, limit);
        
        const posts = [];
    
        for (const postId of postIds) {
            const hasAccess = await this.notificationService.checkPostAccessForNotification(userName, postId);
    
            if (hasAccess) {
                const post = await this.postRepService.getPostById(postId);
                if (post) {
                    posts.push({
                        photoUrl: post.photoUrls[0],
                        postId: post._id,
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
