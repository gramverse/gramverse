import { z } from "zod";

export const zodProfileDto = z.object({
    email: z.string().nonempty(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    isPrivate: z.boolean(),
    profileImage: z.string().optional(),
    bio: z.string(),
});

export type EditProfileDto = z.infer<typeof zodProfileDto>;