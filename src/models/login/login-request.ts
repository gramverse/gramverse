import { z } from "zod";

export const zodLoginRequest = z.object({
    userName : z.string().nonempty(),
    password : z.string().nonempty(),
    rememberMe : z.boolean(),
});

export type LoginRequest = z.infer<typeof zodLoginRequest> 