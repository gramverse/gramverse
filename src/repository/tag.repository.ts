import {Model} from "mongoose";
import {tagSchema} from "../models/tag/tag-schema";
import {ITag, Tag} from "../models/tag/tag";
import {TagRequest} from "../models/tag/tag-request";

export class TagRepository {
    private tags: Model<ITag>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.tags = dataHandler.model<ITag>("tags", tagSchema);
    }

    add = async (tagRequest: TagRequest) => {
        const createdTag = await this.tags.create(tagRequest);
        if (!createdTag) {
            return undefined;
        }
        const newTag: Tag = createdTag;
        return newTag;
    };

    findPostTags = async (postId: string): Promise<Tag[]> => {
        return (await this.tags.find({postId})).map((t) => t.toObject());
    };

    deleteTag = async (_id: string) => {
        const result = await this.tags.updateOne({_id}, {isDeleted: true});
        return result.acknowledged;
    };

    undeleteTag = async (_id: string) => {
        const result = await this.tags.updateOne({_id}, {isDeleted: false});
        return result.acknowledged;
    };
}
