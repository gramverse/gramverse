import { z } from 'zod';

const signUpSchema = z.object({
    userName: z.string().min(8).max(255).regex(/^[a-zA-Z0-9.]+$/),
    email: z.string().email(),
    password: z.string().min(8).max(255).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/),
});

export const validateSignUpInput = (input: { userName: string, email: string, password: string }) => {
    return signUpSchema.parse(input);
};
