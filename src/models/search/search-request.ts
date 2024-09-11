import {z} from "zod";

export const zodSearchRequest = z.object({
    tag: z.coerce.string().nonempty(),
    page: z.coerce.number(),
    limit: z.coerce.number(),
});
