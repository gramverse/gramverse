import { Model } from "mongoose";
import {followSchema} from "../models/follow-schema";
import {IFollow,Follow} from "../models/follow-response"

export class FollowRepository {
    private follows: Model<IFollow>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.follows = dataHandler.model("follows", followSchema);
    }

    add = async (follow: Follow) => {
        const createdFollow = await this.follows.create(follow);
        if (!createdFollow) {
            return undefined;
        }
        const newFollow: Follow = createdFollow;
        return newFollow;
    }
}