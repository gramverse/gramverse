import { AuthorizedUser } from "../models/profile/authorized-user";

export const maxExpirationTimeCalculator = async (users: AuthorizedUser[]) => {
    const currentMilliseconds = new Date().getTime();
    const expirationMillisecondsForEveryUser: number[] = users.map(u => new Date(u.expirationTime).getTime())
    .map(t => t - currentMilliseconds);
    return Math.max(... expirationMillisecondsForEveryUser);
}