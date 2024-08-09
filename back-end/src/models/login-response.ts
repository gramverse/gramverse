export type LoginResponse = {
    user : User,
    token : string,
} ;

export interface IUser extends Document {
    _id?: string;
    userName: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    email: string;
    passwordHash: string;
    isPrivate: boolean;
    bio: string;
}

export type User = {
    _id?: string,
    userName: string,
    firstName: string,
    lastName: string,
    profilePicture: string,
    email: string,
    passwordHash: string,
    isPrivate: boolean,
    bio: string,
};

export type UserToValidate = {
    _id?: string,
    userName: string,
    firstName: string,
    lastName: string,
    profilePicture: string,
    email: string,
    password: string,
    isPrivate: boolean,
    bio: string,
};
