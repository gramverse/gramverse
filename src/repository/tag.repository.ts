import { Model } from "mongoose";
import {tagSchema} from "../models/tag/tag-schema";
import {ITag,Tag} from "../models/tag/tag"

export class TagRepository {
    private tags: Model<ITag>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.tags = dataHandler.model<ITag>("tags", tagSchema);
    }

    add = async (tag: Tag) => {
        const createdTag = await this.tags.create(tag);
        if (!createdTag) {
            return undefined;
        }
        const newTag: Tag = createdTag;
        return newTag;
    }
}