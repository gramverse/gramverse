import { PostRequest } from '../models/post/post-request'
import { PostRepository } from '../repository/post.repository';
import { Post } from '../models/post/post';
import { TagRepository } from '../repository/tag.repository'
import { Tag } from '../models/tag/tag';
import { PostDto } from '../models/post/post-dto';
import {PostDetailDto} from "../models/post/post-detail-dto";
import { HttpError } from '../errors/http-error';
import { ErrorCode } from '../errors/error-codes';
import {EditPostRequest} from "../models/post/edit-post-request";
import {TagRequest} from "../models/tag/tag-request";
import { LikeDto, LikeRequest } from '../models/like/like-request'
import { LikesRepository } from '../repository/likes.repository' 
import { CommentsLikeRequest, zodCommentslikeRequest, CommentsLikeDto } from '../models/commentslike/commentslike-request';
import { CommentslikeRepository } from '../repository/commentslike.repository'; 

export interface IPostService{
    extractHashtags : (text : string) => Array<String>;
    addPost : (postRequest : PostRequest) => Promise<Post | undefined>
    getPosts: (userName : string) => Promise<PostDto[]> 
}

export class PostService implements IPostService{
    constructor(private postRepository : PostRepository, private tagRepository : TagRepository, private likesRepository : LikesRepository, private commentslikeRepository: CommentslikeRepository) {}
    

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
    likePost = async (likeRequest : LikeRequest) => {
        const existingLike = await this.likesRepository.getLike(likeRequest.userName, likeRequest.postId)
        console.log("existingLike in like = ", existingLike);
        if  (existingLike){
            if (!existingLike.isDeleted){
                return true;
            }
            const undeleteResult = await this.likesRepository.undeleteLike(likeRequest.userName, likeRequest.postId)
            console.log("undeleResult in like = ", undeleteResult);
            if (undeleteResult){
                return true;
            }
            return false;
        }
        const likeDto: LikeDto = {userName: likeRequest.userName, postId: likeRequest.postId, isDeleted: false}
        const insertDto = (await this.likesRepository.add(likeDto))
        console.log("insertDto in like is =", insertDto);
        if (!insertDto){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown problem occurred")
        }
        return true;

    }

    unlikePost = async (likeRequest : LikeRequest) => {
        const likeDto: LikeDto = {userName: likeRequest.userName, postId: likeRequest.postId, isDeleted: true}
        const existingLike = await this.likesRepository.getLike(likeRequest.userName, likeRequest.postId);
        console.log("existingLike in unlike = ", existingLike);
        if (!existingLike || existingLike.isDeleted) {
            return true;
        }
        const deleteResult = (await this.likesRepository.deleteLike(likeRequest.userName, likeRequest.postId))
        console.log("deleteResult in unlike = ", deleteResult);
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
}
