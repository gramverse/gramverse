export type LoginResponse = {
    user: User;
    token: string;
    expireTime: number;
};

export interface IUser extends User, Document {}

export type User = {
    _id: string;
    userName: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    email: string;
    passwordHash: string;
    isPrivate: boolean;
    bio: string;
    followerCount: number;
};

export type UserToValidate = Omit<User, "passwordHash"> & {password: string};
