import {Model} from "mongoose";
import {mentionSchema} from "../models/mention/mention-schema";
import {IMentiont, Mention} from "../models/mention/mention";
import {MentionDto} from "../models/mention/mention-request";
import {convertType} from "../utilities/convert-type";

export class MentionsRepository {
    private mentions: Model<IMentiont>;
    constructor(private datahandler: typeof import("mongoose")) {
        this.mentions = datahandler.model<IMentiont>("mentions", mentionSchema);
    }

    add = async (mentionDto: MentionDto) => {
        const createdMention = await this.mentions.create(mentionDto);
        return createdMention._id;
    };
    getCountByPostId = async (postId: string) => {
        return await this.mentions.countDocuments({postId, isDeleted: false});
    };
    mentionExists = async (userName: string, postId: string) => {
        const mention = await this.mentions.findOne({
            userName,
            postId,
        });
        return !!mention;
    };
    deleteMention = async (userName: string, postId: string) => {
        await this.mentions.updateOne({userName, postId}, {isDeleted: true});
    };
    undeleteMention = async (userName: string, postId: string) => {
        await this.mentions.updateOne({userName, postId}, {isDeleted: false});
    };
    getMention = async (userName: string, postId: string) => {
        const mention = await this.mentions.findOne({userName, postId});
        return convertType<Mention, IMentiont>(mention);
    };
    getMentions = async (userName: string, skip: number, limit: number) => {
        const postIds = await this.mentions
            .distinct("postId", {userName})
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
        return postIds;
    };
    getCountMentions = async (userName: string) => {
        return await this.mentions.countDocuments({userName});
    };
}
