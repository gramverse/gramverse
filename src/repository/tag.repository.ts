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
        const tags = await this.tags.find({postId}).lean();
        return tags;
    };

    deleteTag = async (_id: string) => {
        await this.tags.updateOne({_id}, {isDeleted: true});
    };

    undeleteTag = async (_id: string) => {
        await this.tags.updateOne({_id}, {isDeleted: false});
    };

    suggestTag = async (tag: string, skip: number, limit: number) => {
        const results = await this.tags.aggregate([
            {
                $match: {
                    tag: { $regex: tag, $options: 'i' }, 
                    isDeleted: false 
                }
            },
            {
                $group: {
                    _id: "$tag", 
                    postCount: { $sum: 1 } 
                }
            },
            {
                $sort: { postCount: -1 } 
            },
            {
                $skip: skip 
            },
            {
                $limit: limit 
            }
        ]);

        return results;
    };
    
    searchTag = async (tag: string, skip: number, limit: number) => {
        const results = await this.tags.aggregate([
            {
                $match: {
                    tag: { $regex: tag, $options: 'i' }, 
                    isDeleted: false 
                }
            },
            {
                $addFields: {
                    postIdObj: { $toObjectId: "$postId" } 
                }
            },
            {
                $lookup: {
                    from: "posts", 
                    localField: "postIdObj",  
                    foreignField: "_id", 
                    as: "postDetails" 
                }
            },
            {
                $unwind: "$postDetails"
            },
            {
                $lookup: {
                    from: "likes", 
                    localField: "postIdObj",  
                    foreignField: "postId",
                    as: "likeDetails"
                }
            },
            {
                $addFields: {
                    likeCount: {
                        $size: {
                            $filter: {
                                input: "$likeDetails",
                                as: "like",
                                cond: { $eq: ["$$like.isDeleted", false] } 
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$postIdObj",
                    postDetails: { $first: "$postDetails" },
                    likeCount: { $first: "$likeCount" }
                }
            },
            {
                $sort: { likeCount: -1 }
            },
            {
                $skip: skip 
            },
            {
                $limit: limit 
            },
            {
                $project: {
                    _id: 0, 
                    postId: "$postDetails._id",
                    userName: "$postDetails.userName",
                    postImage: { $ifNull: [{ $arrayElemAt: ["$postDetails.photoUrls", 0] }, "no-image.jpg"] } 
                }
            }
        ]);
    
        return results;
    };
    
    searchSpecTag = async (tag: string, skip: number, limit: number) => {
        const results = await this.tags.aggregate([
            {
                $match: {
                    tag: { $regex: `^${tag}$`, $options: 'i' }, 
                    isDeleted: false 
                }
            },
            {
                $addFields: {
                    postIdObj: { $toObjectId: "$postId" } 
                }
            },
            {
                $lookup: {
                    from: "posts", 
                    localField: "postIdObj",  
                    foreignField: "_id", 
                    as: "postDetails" 
                }
            },
            {
                $unwind: "$postDetails"
            },
            {
                $lookup: {
                    from: "likes", 
                    localField: "postIdObj",  
                    foreignField: "postId",
                    as: "likeDetails"
                }
            },
            {
                $addFields: {
                    likeCount: {
                        $size: {
                            $filter: {
                                input: "$likeDetails",
                                as: "like",
                                cond: { $eq: ["$$like.isDeleted", false] } 
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$postIdObj",
                    postDetails: { $first: "$postDetails" },
                    likeCount: { $first: "$likeCount" }
                }
            },
            {
                $sort: { likeCount: -1 }
            },
            {
                $skip: skip 
            },
            {
                $limit: limit 
            },
            {
                $project: {
                    _id: 0, 
                    postId: "$postDetails._id",
                    userName: "$postDetails.userName",
                    postImage: { $ifNull: [{ $arrayElemAt: ["$postDetails.photoUrls", 0] }, "no-image.jpg"] } 
                }
            }
        ]);
    
        return results;
    };
    specTagCount = async (tag: string) => {
        const totalPosts = await this.tags.countDocuments({
            tag: tag,
            isDeleted: false
        });
    
        return totalPosts;
    };
    
    countSuggestedTags = async (tag: string) => {
        const count = await this.tags.aggregate([
            {
                $match: {
                    tag: { $regex: tag, $options: 'i' }, 
                    isDeleted: false 
                }
            },
            {
                $group: {
                    _id: "$tag", 
                }
            },
            {
                $count: "totalCount"
            }
        ]);  
        return count.length > 0 ? count[0].totalCount : 0;
    };
    tagCount = async (tag: string) => {
        const totalPosts = await this.tags.countDocuments({
            tag: { $regex: tag, $options: "i" },
            isDeleted: false
        });
    
        return totalPosts;
    };
    
}