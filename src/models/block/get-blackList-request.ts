import {z} from "zod";

export const zodGetBlackListRequest = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
});
