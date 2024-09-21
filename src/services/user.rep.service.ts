import {User} from "../models/login/login-response";
import {FollowRepository} from "../repository/follow.repository";
import {UserRepository} from "../repository/user.repository";

export class UserRepService {
    constructor(
        private userRepository: UserRepository,
        private followRepository: FollowRepository,
    ) {}

    createUser = async (user: Partial<User>) => {
        return await this.userRepository.add(user);
    };

    getUser = async (userNameOrEmail: string) => {
        const isEmail = userNameOrEmail.includes("@");
        let user;
        if (isEmail) {
            user = await this.userRepository.getUserByEmail(userNameOrEmail);
        } else {
            user = await this.userRepository.getUserByUserName(userNameOrEmail);
        }
        return user;
    };

    checkEmailExistance = async (email: string) => {
        return await this.userRepository.checkEmailExistance(email);
    };

    checkUserNameExistance = async (userName: string) => {
        return await this.userRepository.checkUserNameExistance(userName);
    };

    updateUser = async (userName: string, user: Partial<User>) => {
        await this.userRepository.update(userName, user);
    };

    getAllUsers = async () => {
        return await this.userRepository.getAllUsers();
    };
    searchAccounts = async (
        myUserName: string,
        tag: string,
        limit: number,
        page: number,
    ) => {
        const skip = (page - 1) * limit;
        const posts: {
            userName: string;
            firstName: string;
            lastName: string;
            profileImage: string;
            followerCount: number;
        }[] = await this.userRepository.searchAccount(
            tag,
            myUserName,
        );

        
        let followState;
        const tempUsers = await Promise.all(
            posts.map(async (post) => {
                const existingFollow = await this.followRepository.followExists(
                    myUserName,
                    post.userName,
                );
                if (!existingFollow) {
                    followState = "none";
                } else {
                    const follow = await this.followRepository.getFollow(
                        myUserName,
                        post.userName,
                    );
                    followState = follow?.followRequestState;
                }
                return {
                    ...post,
                    followState,
                };
            }),
        );

        const nonpaginated =[];
        for (const user of tempUsers) {
            const followCheckForFollowing = await this.followRepository.getFollow(user.userName, myUserName);
            const followCheckForFollower = await this.followRepository.getFollow(myUserName, user.userName);
            if (!followCheckForFollower && !followCheckForFollowing) {
                nonpaginated.push(user);
            }
        }
        const users = nonpaginated.slice(skip, skip + limit);
        const totalCount = tempUsers.length;
        
        return {users, totalCount};
    };
}
