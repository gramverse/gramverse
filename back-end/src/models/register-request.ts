import { z } from "zod";

export const zodRegisterRequest = z.object({
    userName: z.string().nonempty(),
    email: z.string().nonempty(),
    password: z.string().nonempty(),
});

export type RegisterRequest = z.infer<typeof zodRegisterRequest>;