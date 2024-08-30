import { z } from "zod";

export const zodGetCloseFriendsRequest = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
});