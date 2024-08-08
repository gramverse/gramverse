export interface IUserRepository {
    add: (user: any) => Promise<any>;
    checkEmailExistance: (email: string) => Promise<boolean>;
    checkUserNameExistance: (userName: string) => Promise<boolean>;
    getUserByEmail: (email: string) => Promise<any | undefined>;
    getUserByUsername: (userName: string) => Promise<any | undefined>;
}
