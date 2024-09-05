import { z } from "zod";

export const zodAddEventRequest = z.object({
    eventType: z.coerce.string(),
    performerUserName: z.coerce.string(),
    targetId: z.coerce.string()
});

export type AddEventRequest = z.infer<typeof zodAddEventRequest>;
