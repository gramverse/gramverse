export interface IUserService {
    signUp: (userName: string, email: string, password: string) => Promise<{ user: any, token: string }>;
}
