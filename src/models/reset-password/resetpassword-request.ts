import {z} from "zod";

export const zodResetPasswordRequest = z.object({
    token: z.string(),
    newPassword: z.string(),
});

export type ResetPasswordRequest = z.infer<typeof zodResetPasswordRequest>;
