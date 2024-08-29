import { z } from "zod";

export const zodFollowingersRequest = z.object({
    userName: z.string().nonempty(),
    isFollowing: z.coerce.boolean(),
    page: z.coerce.number().min(1).default(1),   
    limit: z.coerce.number().min(1).max(100).default(10) 
})

export type FollowingersRequest = z.infer<typeof zodFollowingersRequest>;