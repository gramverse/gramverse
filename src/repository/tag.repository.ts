import {Model} from "mongoose";
import {tagSchema} from "../models/tag/tag-schema";
import {ITag, Tag} from "../models/tag/tag";
import {TagRequest} from "../models/tag/tag-request";
import {convertTypeForArray} from "../utilities/convert-type";

export class TagRepository {
    private tags: Model<ITag>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.tags = dataHandler.model<ITag>("tags", tagSchema);
    }

    add = async (tagRequest: TagRequest) => {
        const createdTag = await this.tags.create(tagRequest);
        return createdTag._id;
    };

    findPostTags = async (postId: string): Promise<Tag[]> => {
        const tags = await this.tags.find({postId});
        return tags;
    };

    deleteTag = async (_id: string) => {
        await this.tags.updateOne({_id}, {isDeleted: true});
    };

    undeleteTag = async (_id: string) => {
        await this.tags.updateOne({_id}, {isDeleted: false});
    };
}
