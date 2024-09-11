export type AuthorizedUser = {
    _id: string,
    userName: string,
    email: string,
    creationTime: Date,
    expirationTime: Date,
};

export type MultiUserToken = {
    currentUser: AuthorizedUser,
    loggedInUsers: AuthorizedUser[],
};