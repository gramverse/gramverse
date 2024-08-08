export type LoginResponse = {
    user : User | undefined;
    token : string | undefined;
} 
type User = {
    _id: string,
    userName: string,
    firstName: string,
    lastName: string,
    profilePicture: string,
    email: string,
    passwordHash: string
    isPublic: boolean,
    bio: string,
}
