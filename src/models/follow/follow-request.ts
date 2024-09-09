import z from "zod"
import {FollowRequestState} from "./follow-request-state";

export const zodFollowRequest = z.object({
    followerUserName: z.string().nonempty(),
    followingUserName: z.string().nonempty(),
});
