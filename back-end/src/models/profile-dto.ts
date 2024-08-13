import { z } from "zod";

export const zodProfileDto = z.object({
    userName: z.string().nonempty(),
    email: z.string().nonempty(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    isPrivate: z.boolean(),
    profileImage: z.string(),
    bio: z.string(),
});

export type ProfileDto = z.infer<typeof zodProfileDto>;