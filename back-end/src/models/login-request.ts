import { z } from "zod";

export const zodLoginRequest = z.object({
    userName : z.string().nonempty(),
    password : z.string().nonempty(),
    

})
export type LoginRequest = z.infer<typeof zodLoginRequest> 