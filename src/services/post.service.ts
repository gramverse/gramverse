import { PostRequest } from '../models/post/post-request'
import { PostRepository } from '../repository/post.repository';
import { Post } from '../models/post/post';
import { TagRepository } from '../repository/tag.repository'
import { Tag } from '../models/tag/tag';
import { PostDto } from '../models/post/post-dto'


export interface IPostService{
    extractHashtags : (text : string) => Array<String>;
    addPost : (postRequest : PostRequest) => Promise<Post | undefined>
    getPost : (userName : string) => Promise<PostDto[]> 
}

export class PostService implements IPostService{
    constructor(private postRepository : PostRepository, private tagRepository : TagRepository) {}
    

    extractHashtags =  (text : string) => {
        const regex = /#[\w]+/g;

        const matches = text.match(regex);
        
        return matches ? matches.map(tag => tag.slice(1)) : [];
    }

    addPost = async (postRequest : PostRequest) =>{
        
        const createdPost = await this.postRepository.add(postRequest);
        if (!createdPost){
            return undefined;
        } 
        const tags : Array<string> = this.extractHashtags(createdPost.caption)
        tags.forEach(async  t => {
            const newTag : Tag = {
                postId : createdPost._id,
                tag : t, 
                isDeleted : false
            }
            
            
            await this.tagRepository.add(newTag)
        })
        return createdPost;
        
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


    
    

    



}
        




