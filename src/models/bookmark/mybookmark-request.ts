import {z} from "zod";

export const zodMyBookMarkRequest = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
});

export type MyBookMarkRequest = z.infer<typeof zodMyBookMarkRequest>;
