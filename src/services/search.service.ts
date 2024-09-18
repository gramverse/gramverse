import { TagRepository } from "../repository/tag.repository";
import { UserRepService } from "./user.rep.service";

export class SearchService {
    constructor(
        private tagRepository: TagRepository, UserRepService: UserRepService
    ) {}
    searchTags = async (tag: string,limit: number, page: number ) => {
        const skip = (page - 1) * limit
        const totalCount = await this.tagRepository.tagCount(tag)
        const posts = await this.tagRepository.searchTag(tag,skip,limit)
        return{posts,totalCount}
    }
    searchSpecTags = async (tag: string,limit: number, page: number ) => {
        const skip = (page - 1) * limit
        const totalCount = await this.tagRepository.specTagCount(tag)
        const posts = await this.tagRepository.searchSpecTag(tag,skip,limit)
        return{posts,totalCount}
    }
    SuggestTags = async (tag: string,limit: number, page: number) => {
        const skip = (page - 1) * limit
        const totalCount = await this.tagRepository.countSuggestedTags(tag)
        const tags = await this.tagRepository.suggestTag(tag,skip,limit)
        return {tags, totalCount}
    }

}    
