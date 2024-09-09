import {z} from "zod";

export const zodNotificationRequest = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
});
