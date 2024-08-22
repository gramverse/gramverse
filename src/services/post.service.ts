import { PostRequest } from '../models/post/post-request'
import { PostRepository } from '../repository/post.repository';
import { Post } from '../models/post/post';
import { TagRepository } from '../repository/tag.repository'
import { Tag } from '../models/tag/tag';
import { PostDto } from '../models/post/post-dto'
import { HttpError } from '../errors/http-error';
import { ErrorCode } from '../errors/error-codes';
import {EditPostRequest} from "../models/post/edit-post-request";
import {TagRequest} from "../models/tag/tag-request";

export interface IPostService{
    extractHashtags : (text : string) => Array<String>;
    addPost : (postRequest : PostRequest) => Promise<Post | undefined>
    getPost : (userName : string) => Promise<PostDto[]> 
}

export class PostService implements IPostService{
    constructor(private postRepository : PostRepository, private tagRepository : TagRepository, private likesRepository: LikesRepository) {}
    

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

    getPost = async (userName : string) => {
        const postDtos : PostDto[] = [];
        const posts = await this.postRepository.getPostsByUserName(userName);
        posts.forEach(async p => {
            const postDto : PostDto = {
                ...p,
                tags : await this.extractHashtags(p.caption) 
            }
            postDtos.push(postDto)
        })
        return postDtos;
    }

    likePost = async (likeRequest : LikeRequest) => {
        const existingLike = await this.likesRepository.getLike(likeRequest.userName, likeRequest.postId)
        if  (existingLike){
            if (!existingLike.isDeleted){
                return true;
            }
            if (await this.likesRepository.undeleteLike(likeRequest.userName, likeRequest.postId)){
                return true;
            }
            return false;
        }
        const likeDto: LikeDto = {userName: likeRequest.userName, postId: likeRequest.postId, isDeleted: false}
        if (!(await this.likesRepository.add(likeDto))){
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown problem occured")
        }

    }

    unlikePost = async (likeRequest : LikeRequest) => {
        const likeDto: LikeDto = {userName: likeRequest.userName, postId: likeRequest.postId, isDeleted: true}
        const existingLike = await this.likesRepository.getLike(likeRequest.userName, likeRequest.postId)
        if (!existingLike || existingLike.isDeleted) {
            return true;
        }
        if (!(await this.likesRepository.deleteLike(likeRequest.userName, likeRequest.postId))){
            return false;
        }
        return true;
    }

}
