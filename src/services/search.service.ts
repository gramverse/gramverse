import { postRepService } from "../config";
import { TagRepository } from "../repository/tag.repository";
import { UserRepService } from "./user.rep.service";

export class SearchService {
    constructor(
        private tagRepository: TagRepository, UserRepService: UserRepService
    ) {}
    // searchTags = async (tag: string,limit: number, page: number,userName: string ) => {
    //     const skip = (page - 1) * limit
    //     const totalCount = await this.tagRepository.tagCount(tag)
    //     const posts = await this.tagRepository.searchTag(tag)
        
    //     const accessiblePosts = await Promise.all(
    //         posts.map(async (post) => {
    //             const { postId } = post.parse;
    //             const hasAccess = await postRepService.checkPostAccess(postId, userName);
    //             return hasAccess ? post : null;
    //         })
    //     );
    //     const filteredPosts = accessiblePosts.filter(post => post !== null);
        
    
    //     return {filteredPosts,totalCount};
    // }

    searchTags = async (tag: string, limit: number, page: number, userName: string) => {
        const skip = (page - 1) * limit;
    
        const posts = await this.tagRepository.searchTag(tag); 
    
        const accessiblePosts = await Promise.all(
            posts.map(async (post) => {
                const { postId } = post.parse;
                const hasAccess = await postRepService.checkPostAccess(userName, postId);
                return hasAccess ? post : null;
            })
        );
    
        const filteredPosts = accessiblePosts.filter(post => post !== null);
        console.log(filteredPosts, "filteredPosts")        
        const totalCount = filteredPosts.length;
    
        const paginatedPosts = filteredPosts.slice(skip, skip + limit);
    
        return { filteredPosts: paginatedPosts, totalCount };
    };
    


    searchSpecTags = async (tag: string,limit: number, page: number ) => {
        const skip = (page - 1) * limit
        const totalCount = await this.tagRepository.specTagCount(tag)
        const posts = await this.tagRepository.searchSpecTag(tag)
        return{posts,totalCount}
    }
    SuggestTags = async (tag: string,limit: number, page: number) => {
        const skip = (page - 1) * limit
        const totalCount = await this.tagRepository.countSuggestedTags(tag)
        const tags = await this.tagRepository.suggestTag(tag,skip,limit)
        return {tags, totalCount}
    }

}    
