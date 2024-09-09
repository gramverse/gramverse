import {z} from "zod";

export const zodAddNotifRequest = z.object({
    eventId: z.coerce.string(),
    userName: z.coerce.string(),
});

export type AddNotifRequest = z.infer<typeof zodAddNotifRequest>;
