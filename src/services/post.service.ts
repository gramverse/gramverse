import { PostRequest } from '../models/post/post-request'
import { PostRepository } from '../repository/post.repository';
import { Post } from '../models/post/post';
import { TagRepository } from '../repository/tag.repository'
import {CommentsRepository} from "../repository/comments.repository";
import {BookmarksRepository} from "../repository/bookmarks.repository";
import {LikesRepository} from "../repository/likes.repository";
import { CommentslikeRepository} from "../repository/commentslike.repository";
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

export interface IPostService{
    extractHashtags : (text : string) => Array<String>;
    addPost : (postRequest : PostRequest) => Promise<Post | undefined>
    getPosts: (userName : string) => Promise<PostDto[]> 
}

export class PostService implements IPostService{
    constructor(private postRepository : PostRepository, private tagRepository : TagRepository, private commentsRepository: CommentsRepository, private bookmarksRepository: BookmarksRepository, private likesRepository: LikesRepository, private commentslikeRepository: CommentslikeRepository, private bookmarkRepository: BookmarksRepository) {}

    extractHashtags =  (text : string) => {
        const regex = /#[\w]+/g;

        const matches = text.match(regex);
        
        return matches ? Array.from(new Set(matches.map(tag => tag.slice(1)))) : [];
    }

    addPost = async (postRequest : PostRequest) =>{
        if (postRequest.photoUrls.length == 0) {
            throw new HttpError(400, ErrorCode.MISSING_PHOTO_FOR_POST, "Missing photo for post");
        }
        const createdPost = await this.postRepository.add(postRequest);
        if (!createdPost){
            return undefined;
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
        return createdPost;
    }

    editPost = async (editPostRequest: EditPostRequest) => {
        if (editPostRequest.photoUrls.length < 1) {
            throw new HttpError(400, ErrorCode.MISSING_PHOTO_FOR_POST, "Missing photo for post");
        }
        if (editPostRequest.photoUrls.length > 10) {
            throw new HttpError(400, ErrorCode.PHOTO_COUNT_EXCEDED, "Maximum photo count = 10");
        }
        const postTags = await this.tagRepository.findPostTags(editPostRequest._id);
        const oldTags = postTags.filter(t => !t.isDeleted);
        const newTags = await this.extractHashtags(editPostRequest.caption);
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
        return postDto;
    }

    getPosts = async (userName : string) => {
        const postDtos : PostDto[] = [];
        const posts = await this.postRepository.getPostsByUserName(userName);
        posts.forEach(async p => {
            const postDto : PostDto = {
                ...p,
                tags: await this.extractHashtags(p.caption)
            }
            postDtos.push(postDto)
        })
        return postDtos;
    }

    getCommentDto = async (userName: string, comment: Comment) => {
        const commentDto: CommentDto = {
            ...comment,
            isLiked: await this.commentslikeRepository.commentslikeExists(userName, comment._id),
            likesCount: await this.commentslikeRepository.getCountByCommentId(comment._id),
            childComments: []
        };
        return commentDto;
    }

    getComments = async (userName: string, postId: string,page: number,limit: number) => {
        const skip = (page -1) * limit
        const allComments = await this.commentsRepository.getByPostId(postId,skip,limit);
        const allDtos: CommentDto[] = [];
        const promises = allComments.map(async c => {
            const dto: CommentDto = await this.getCommentDto(userName, c);
            allDtos.push(dto);
        });
        await Promise.all(promises);
        const unflattenedComments = unflattener(allDtos);
        return unflattenedComments;
    }

    getPostById = async (_id: string, userName: string,page: number,limit: number) => {
        const skip = (page -1) * limit
        
        const post = await this.postRepository.getPostById(_id);
        if (!post) {
            return;
        }
        const tags = (await this.tagRepository.findPostTags(_id))
            .filter(t => !t.isDeleted)
            .map(t => t.tag);
        const comments: CommentDto[] = await this.getComments(userName, _id,skip,limit);
        const commentsCount = await this.commentsRepository.getCountByPostId(_id);
        const likesCount = await this.likesRepository.getCountByPostId(_id);
        const bookmarksCount = await this.bookmarksRepository.getCountByPostId(_id);
        const isLiked = await this.likesRepository.likeExists(userName, _id);
        const isBookmarked = await this.bookmarksRepository.bookmarkExists(userName, _id);
        const postDetailDto: PostDetailDto = {
            ... post,
            tags,
            comments,
            commentsCount,
            likesCount,
            bookmarksCount,
            isLiked,
            isBookmarked,
        };
        return postDetailDto;
    }

    likePost = async (likeRequest : LikeRequest) => {
        const existingLike = await this.likesRepository.getLike(likeRequest.userName, likeRequest.postId)
        if  (existingLike){
            if (!existingLike.isDeleted){
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
        return true;

    }

    unlikePost = async (likeRequest : LikeRequest) => {
        const likeDto: LikeDto = {userName: likeRequest.userName, postId: likeRequest.postId, isDeleted: true}
        const existingLike = await this.likesRepository.getLike(likeRequest.userName, likeRequest.postId);
        if (!existingLike || existingLike.isDeleted) {
            return true;
        }
        const deleteResult = (await this.likesRepository.deleteLike(likeRequest.userName, likeRequest.postId))
        if (!deleteResult){
            return false;
        }
        return true;
    }
    
    likeComment = async (commentslikeRequest: CommentsLikeRequest) => {
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
        const commentsLikeDto: CommentsLikeDto = {userName: commentslikeRequest.userName, commentId: commentslikeRequest.commentId, isDeleted: true}
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
            throw new HttpError(400, ErrorCode.COMMENT_INVALID_PARRENT_ID, "Parent comment doesn't exist");
        }
        const createdComment = await this.commentsRepository.add(commentRequest);
        return createdComment||undefined;
    }
    bookmark = async (bookmarkRequest: BookmarkRequest) =>{
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
        const bookmarkDto: BookmarkDto = {userName: bookmarkRequest.userName, postId: bookmarkRequest.postId, isDeleted: true}
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
}
