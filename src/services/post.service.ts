import { PostRequest } from '../models/post/post-request'
import { PostRepository } from '../repository/post.repository';
import { Post } from '../models/post/post';
import {UserRepository} from "../repository/user.repository";
import { TagRepository } from '../repository/tag.repository'
import {CommentsRepository} from "../repository/comments.repository";
import {BookmarksRepository} from "../repository/bookmarks.repository";
import {LikesRepository} from "../repository/likes.repository";
import { CommentslikeRepository} from "../repository/commentslike.repository";
import {FollowRepository} from "../repository/follow.repository";
import { Tag } from '../models/tag/tag';
import { PostDto } from '../models/post/post-dto';
import {PostDetailDto} from "../models/post/post-detail-dto";
import { HttpError } from '../errors/http-error';
import { ErrorCode } from '../errors/error-codes';
import {EditPostRequest} from "../models/post/edit-post-request";
import {TagRequest} from "../models/tag/tag-request";
import {CommentDto} from "../models/comment/comment-dto";
import {Comment} from "../models/comment/comment";
import {unflattener} from "../utilities/unflattener";
import { LikeDto, LikeRequest } from '../models/like/like-request'
import { CommentsLikeRequest, zodCommentslikeRequest, CommentsLikeDto } from '../models/commentslike/commentslike-request';
import { CommentRequest } from '../models/comment/comment-request';
import { BookmarkDto, BookmarkRequest } from '../models/bookmark/bookmark-request';
import { forEachChild, getModeForFileReference, hasRestParameter } from 'typescript';
import {FollowRequestState} from "../models/follow/follow-request-state";
import {ExplorePostDto} from "../models/post/explore-post-dto";
import { userService } from '../config';
import { NotificationRepository } from '../repository/notification.repository';
import { NotificationService } from './notification.service';

export class PostService {
    constructor(private postRepository : PostRepository, private userRepository: UserRepository, private tagRepository : TagRepository, private commentsRepository: CommentsRepository, private bookmarksRepository: BookmarksRepository, private likesRepository: LikesRepository, private commentslikeRepository: CommentslikeRepository, private bookmarkRepository: BookmarksRepository, private followRepository: FollowRepository,private notificationService:NotificationService ) {}

    extractHashtags =  (text : string) => {
        const regex = /#[\w]+/g;

        const matches = text.match(regex);
        
        return matches ? Array.from(new Set(matches.map(tag => tag.slice(1)))) : [];
    }

    checkMentions = async (myUserName: string, oldMentions: string[], newMentions: string[]) => {
        const mentionsToBeRemoved = oldMentions.filter(m => !newMentions.includes(m));
        const mentionsToBeAdded = newMentions.filter(m => !oldMentions.includes(m));
        for (const mention of mentionsToBeAdded) {
            await this.checkMentionAccess(myUserName, mention);
        }
    }

    updateMentions = async (myUserName: string, postId: string, oldMentions: string[], newMentions: string[]) => {
        const mentionsToBeRemoved = oldMentions.filter(m => !newMentions.includes(m));
        const mentionsToBeAdded = newMentions.filter(m => !oldMentions.includes(m));
        for (const mention of mentionsToBeAdded) {
            this.notificationService.addMention(myUserName, mention, postId);
        }
        for (const mention of mentionsToBeRemoved) {
            this.notificationService.deleteNotif(myUserName, mention);
        }
    }

    addPost = async (postRequest : PostRequest) =>{
        if (postRequest.photoUrls.length == 0) {
            throw new HttpError(400, ErrorCode.MISSING_PHOTO_FOR_POST, "Missing photo for post");
        }
        if (postRequest.photoUrls.length > 10) {
            throw new HttpError(400, ErrorCode.PHOTO_COUNT_EXCEDED, "Maximum photo count = 10");
        }
        await this.checkMentions(postRequest.userName, [], postRequest.mentions);
        const createdPost = await this.postRepository.add(postRequest);
        if (!createdPost){
            return;
        } 
        const tags : Array<string> = this.extractHashtags(createdPost.caption)
        tags.forEach(async  t => {
            const newTagRequest: TagRequest = {
                postId : createdPost._id,
                tag : t, 
                isDeleted : false
            }
            await this.tagRepository.add(newTagRequest);
        })
        await this.updateMentions(postRequest.userName, createdPost._id, [], postRequest.mentions);
        return createdPost;
    }

    editPost = async (editPostRequest: EditPostRequest, userName: string) => {
        const post = await this.postRepository.getPostById(editPostRequest._id);
        if (!post) {
            throw new HttpError(404, ErrorCode.POST_NOT_FOUND, "Post not found");
        }
        if (post.userName != userName) {
            throw new HttpError(403, ErrorCode.EDIT_POST_ACCESS_DENIED, "Only post creator can edit post");
        }
        if (editPostRequest.photoUrls.length < 1) {
            throw new HttpError(400, ErrorCode.MISSING_PHOTO_FOR_POST, "Missing photo for post");
        }
        if (editPostRequest.photoUrls.length > 10) {
            throw new HttpError(400, ErrorCode.PHOTO_COUNT_EXCEDED, "Maximum photo count = 10");
        }
        await this.checkMentions(editPostRequest.userName, post.mentions, editPostRequest.mentions);
        const postTags = await this.tagRepository.findPostTags(editPostRequest._id);
        const oldTags = postTags.filter(t => !t.isDeleted);
        const newTags = this.extractHashtags(editPostRequest.caption);
        const tagsToBeDeleted = oldTags.filter(t => !newTags.includes(t.tag));
        const tagsToBeAdded = newTags.filter(t => !oldTags.find(T => T.tag == t));
        tagsToBeDeleted.forEach(async t => {
            await this.tagRepository.deleteTag(t._id);
        });
        tagsToBeAdded.forEach(async t => {
            const deletedTag = postTags.find(tag => tag.tag == t);
            if (deletedTag) {
                await this.tagRepository.undeleteTag(deletedTag._id);
            }else {
                const newTagRequest: TagRequest = {
                    postId: editPostRequest._id,
                    tag: t,
                    isDeleted: false,
                };
                await this.tagRepository.add(newTagRequest);
            }
        });
        const success = await this.postRepository.update(editPostRequest);
        if (!success) {
            return;
        }
        const updatedPost = await this.postRepository.getPostById(editPostRequest._id);
        if (!updatedPost) {
            return;
        }
        const postDto: PostDto = {
            ... updatedPost,
            tags: newTags,
        }
        await this.updateMentions(editPostRequest.userName, editPostRequest._id, post.mentions, editPostRequest.mentions);
        return postDto;
    }

    getPosts = async (userName: string, myUserName: string, page: number, limit: number) => {
        await this.checkUserAccess(myUserName, userName);
        const skip = (page-1) * limit;
        let notForCloseFriends: boolean;
        if (userName == myUserName) {
            notForCloseFriends = false;
        }else {
            const follow = await this.followRepository.getFollow(userName, myUserName);
            notForCloseFriends = (!follow || !follow.isCloseFriend) ? true: false;
        }
        const posts = await this.postRepository.getPostsByUserName(userName, notForCloseFriends, skip, limit);
        const totalCount = await this.postRepository.getPostCount(userName, notForCloseFriends);
        const postDtos : PostDto[] = [];
        posts.forEach(p => {
            const postDto : PostDto = {
                ...p,
                tags: this.extractHashtags(p.caption)
            }
            postDtos.push(postDto)
        })
        return {posts: postDtos, totalCount};
    }

    getCommentDto = async (requestUserName: string, parentCommentUserName: string, comment: Comment) => {
        const {_id, userName, postId, comment: commentText, parentCommentId, creationDate} = comment;
        const commentDto: CommentDto = {
            _id,
            userName,
            postId,
            comment: commentText,
            parentCommentId,
            parentCommentUserName,
            creationDate,
            isLiked: await this.commentslikeRepository.commentslikeExists(userName, comment._id),
            likesCount: await this.commentslikeRepository.getCountByCommentId(comment._id),
            childDtos: [],
        };
        for (const c of comment.childComments) {
            commentDto.childDtos.push(await this.getCommentDto(userName, comment.userName, c));
        }
        return commentDto;
    }

    getComments = async (userName: string, postId: string, page: number, limit: number) => {
        await this.checkPostAccess(userName, postId);
        const skip = (page-1) * limit;
        const parentComments = await this.commentsRepository.getByPostId(postId, skip, limit);
        const allDtos: CommentDto[] = [];
        for (const c of parentComments) {
            const dto: CommentDto = await this.getCommentDto(userName, "", c);
            allDtos.push(dto);
        }
        const commentsCount = await this.commentsRepository.getRootCountByPostId(postId);
        return {comments: allDtos, totalCount: commentsCount};
    }

    getPostDto = async (userName: string, post: Post) => {
        const tags = this.extractHashtags(post.caption);
        const commentsCount = await this.commentsRepository.getCountByPostId(post._id);
        const likesCount = await this.likesRepository.getCountByPostId(post._id);
        const bookmarksCount = await this.bookmarksRepository.getCountByPostId(post._id);
        const isLiked = await this.likesRepository.likeExists(userName, post._id);
        const isBookmarked = await this.bookmarksRepository.bookmarkExists(userName, post._id);
        const postDetailDto: PostDetailDto = {
            ... post,
            tags,
            commentsCount,
            likesCount,
            bookmarksCount,
            isLiked,
            isBookmarked,
        };
        return postDetailDto;
    }

    getPostById = async (_id: string, userName: string) => {
        await this.checkPostAccess(userName, _id);
        const post = await this.postRepository.getPostById(_id);
        if (!post) {
            return;
        }
        return await this.getPostDto(userName, post);
    }

    likePost = async (likeRequest : LikeRequest) => {
        await this.checkPostAccess(likeRequest.userName, likeRequest.postId);
        const existingLike = await this.likesRepository.getLike(likeRequest.userName, likeRequest.postId)
        if  (existingLike){
            if (!existingLike.isDeleted){
                this.notificationService.like(likeRequest.userName,likeRequest.postId)
                return true;
            }
            const undeleteResult = await this.likesRepository.undeleteLike(likeRequest.userName, likeRequest.postId)
            if (undeleteResult){
                return true;
            }
            return false;
        }
        const likeDto: LikeDto = {userName: likeRequest.userName, postId: likeRequest.postId, isDeleted: false}
        const insertDto = (await this.likesRepository.add(likeDto))
        if (!insertDto){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown problem occurred")
        }
        this.notificationService.like(likeRequest.userName,likeRequest.postId)
        return true;
    }

    unlikePost = async (likeRequest : LikeRequest) => {
        await this.checkPostAccess(likeRequest.userName, likeRequest.postId);
        const likeDto: LikeDto = {userName: likeRequest.userName, postId: likeRequest.postId, isDeleted: true}
        const existingLike = await this.likesRepository.getLike(likeRequest.userName, likeRequest.postId);
        if (!existingLike || existingLike.isDeleted) {
            this.notificationService.deleteNotif(likeRequest.userName,likeRequest.postId)
            return true

        }
        const deleteResult = (await this.likesRepository.deleteLike(likeRequest.userName, likeRequest.postId))
        if (!deleteResult){
            return false;
        }
        
        this.notificationService.deleteNotif(likeRequest.userName,likeRequest.postId)
        return true;
    }
    
    likeComment = async (commentslikeRequest: CommentsLikeRequest) => {
        const comment = await this.commentsRepository.getById(commentslikeRequest.commentId);
        if (!comment) {
            throw new HttpError(404, ErrorCode.COMMENT_NOT_FOUND, "Comment not found");
        }
        await this.checkPostAccess(commentslikeRequest.userName, comment.postId);
        const existingCommentsLike = await this.commentslikeRepository.getCommentsLike(commentslikeRequest.userName, commentslikeRequest.commentId)
        if (existingCommentsLike){
            if (!existingCommentsLike.isDeleted){
                return true;
            }
            const undeleteResult = await this.commentslikeRepository.undeleteCommentsLike(commentslikeRequest.userName, commentslikeRequest.commentId);
            if (undeleteResult){
                return true;
            }
            return false;
        }
        const commentsLikeDto: CommentsLikeDto = {userName: commentslikeRequest.userName, commentId: commentslikeRequest.commentId, isDeleted: false}
        const insertDto = await this.commentslikeRepository.add(commentsLikeDto);
        if (!insertDto){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown problem occurred");
        }
        return true;
    }

    unlikeComment = async (commentslikeRequest: CommentsLikeRequest) => {
        const comment = await this.commentsRepository.getById(commentslikeRequest.commentId);
        if (!comment) {
            throw new HttpError(404, ErrorCode.COMMENT_NOT_FOUND, "Comment not found");
        }
        await this.checkPostAccess(commentslikeRequest.userName, comment.postId);
        const existingCommentsLike = await this.commentslikeRepository.getCommentsLike(commentslikeRequest.userName, commentslikeRequest.commentId);
        if (!existingCommentsLike || existingCommentsLike.isDeleted) {
            return true;
        }
        const deleteResult = await this.commentslikeRepository.deleteCommentsLike(commentslikeRequest.userName, commentslikeRequest.commentId);
        if (!deleteResult){
            return false;
        }
        return true;
    }

    addComment = async (commentRequest: CommentRequest) => {
        if (commentRequest.parentCommentId != "" && !(await this.commentsRepository.getById(commentRequest.parentCommentId))) {
            throw new HttpError(400, ErrorCode.COMMENT_INVALID_PARENT_ID, "Parent comment doesn't exist");
        }
        await this.checkPostAccess(commentRequest.userName, commentRequest.postId);
        const createdComment = await this.commentsRepository.add(commentRequest);
        this.notificationService.comment(commentRequest.userName,commentRequest.postId)
        return createdComment||undefined;
    }

    bookmark = async (bookmarkRequest: BookmarkRequest) =>{
        await this.checkPostAccess(bookmarkRequest.userName, bookmarkRequest.postId);
        const existingBookmark = await this.bookmarksRepository.getBookmark(bookmarkRequest.userName, bookmarkRequest.postId);
        if (existingBookmark){
            if (!existingBookmark.isDeleted){
                return true;
            }
            const undeleteResult = await this.bookmarksRepository.undeleteBookmark(bookmarkRequest.userName, bookmarkRequest.postId);
            if (undeleteResult){
                return true;
            }
            return false
        }
        const bookmarkDto: BookmarkDto = {userName: bookmarkRequest.userName, postId: bookmarkRequest.postId, isDeleted: false};
        const insertDto = await this.bookmarksRepository.add(bookmarkDto);
        if (!insertDto){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown problem occurred")
        }
        return true;
    }

    unbookmark = async (bookmarkRequest: BookmarkRequest) => {
        await this.checkPostAccess(bookmarkRequest.userName, bookmarkRequest.postId);
        const existingBookmark = await this.bookmarksRepository.getBookmark(bookmarkRequest.userName, bookmarkRequest.postId);
        if (!existingBookmark || existingBookmark.isDeleted) {
            return true;
        }
        const deleteResult = await this.bookmarksRepository.deleteBookmark(bookmarkRequest.userName, bookmarkRequest.postId);
        if (!deleteResult){
            return false;
        }
        return true;
    }

    checkPostAccess = async (userName: string, postId: string) => {
        const post = await this.postRepository.getPostById(postId);
        if (!post) {
            throw new HttpError(400, ErrorCode.INVALID_POST_ID, "Post doesn't exist");
        }
        if (userName == post.userName) {
            return;
        }
        const visitorFollow = await this.followRepository.getFollow(userName, post.userName);
        const creatorFollow = await this.followRepository.getFollow(post.userName, userName);
        if (visitorFollow && visitorFollow.isBlocked) {
            throw new HttpError(403, ErrorCode.CREATOR_IS_BLOCKED_BY_YOU, "You have blocked this user");
        }
        if (creatorFollow && creatorFollow.isBlocked) {
            throw new HttpError(403, ErrorCode.YOU_ARE_BLOCKED, "This user has blocked you");
        }
        const creatorUser = await this.userRepository.getUserByUserName(post.userName);
        if (!creatorUser) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "post username doesn't exist in users");
        }
        if (creatorUser.isPrivate && (!visitorFollow || visitorFollow.followRequestState != FollowRequestState.ACCEPTED)) {
            throw new HttpError(403, ErrorCode.USER_IS_PRIVATE, "User is private");
        }
    }

    checkUserAccess = async (myUserName: string, userName: string) => {
        if (userName == myUserName) {
            return;
        }
        const visitorFollow = await this.followRepository.getFollow(myUserName, userName);
        const creatorFollow = await this.followRepository.getFollow(userName, myUserName);
        if (visitorFollow && visitorFollow.isBlocked) {
            throw new HttpError(403, ErrorCode.CREATOR_IS_BLOCKED_BY_YOU, "You have blocked this user");
        }
        if (creatorFollow && creatorFollow.isBlocked) {
            throw new HttpError(403, ErrorCode.YOU_ARE_BLOCKED, "This user has blocked you");
        }
        const creatorUser = await this.userRepository.getUserByUserName(userName);
        if (!creatorUser) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "post username doesn't exist in users");
        }
        if (creatorUser.isPrivate && (!visitorFollow || visitorFollow.followRequestState != FollowRequestState.ACCEPTED)) {
            throw new HttpError(403, ErrorCode.USER_IS_PRIVATE, "User is private");
        }
    }

    checkMentionAccess = async (mentioner: string, mentioned: string) => {
        if (mentioner== mentioned) {
            return;
        }
        const mentionerFollow = await this.followRepository.getFollow(mentioner, mentioned);
        const mentionedFollow = await this.followRepository.getFollow(mentioned, mentioner);
        if (mentionerFollow && mentionerFollow.isBlocked) {
            throw new HttpError(403, ErrorCode.CREATOR_IS_BLOCKED_BY_YOU, "You have blocked this user");
        }
        if (mentionedFollow && mentionedFollow.isBlocked) {
            throw new HttpError(403, ErrorCode.YOU_ARE_BLOCKED, "This user has blocked you");
        }
        const mentionedUser = await this.userRepository.getUserByUserName(mentioned);
        if (!mentionedUser) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "post username doesn't exist in users");
        }
    }

    getExplorePosts = async (userName: string, page: number, limit: number) => {
        const skip = (page-1) * limit;
        const allFollows = await this.followRepository.getAllFollowings(userName);
        const followingsList = allFollows.map(f => f.followingUserName);
        const closeFriendsList = allFollows.filter(f => f.isCloseFriend).map(f => f.followingUserName);
        const posts = await this.postRepository.getExplorePosts(closeFriendsList, followingsList, skip, limit);
        const totalCount = await this.postRepository.getExplorePostCount(closeFriendsList, followingsList);
        const postDtos: ExplorePostDto[] = [];
        for (const p of posts) {
            const postDto = await this.getPostDto(userName, p);
            const user = await userService.getUser(p.userName);
            if (!user) {
                throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
            }
            const {profileImage} = user;
            const followerCount = await this.followRepository.getFollowerCount(p.userName);
            const explorePostDto: ExplorePostDto = {
                ...postDto,
                profileImage,
                followerCount,
            };
            postDtos.push(explorePostDto);
        }
        return {postDtos, totalCount};
    }
        
}
