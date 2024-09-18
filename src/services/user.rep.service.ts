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
        const totalCount = await this.userRepository.accountCount(tag);
        const posts: {
            userName: string;
            firstName: string;
            lastName: string;
            profileImage: string;
            followerCount: number;
        }[] = await this.userRepository.searchAccount(
            tag,
            myUserName,
            skip,
            limit,
        );

        const uniqueUsers: typeof posts = [];
        const seenUsernames = new Set<string>();
        posts.forEach((post) => {
            const fullName = post.firstName + " " + post.lastName;
            if (
                !seenUsernames.has(post.userName) &&
                !seenUsernames.has(fullName)
            ) {
                seenUsernames.add(post.userName);
                seenUsernames.add(fullName);
                uniqueUsers.push(post);
            }
        });
        let followState;
        const users = await Promise.all(
            uniqueUsers.map(async (post) => {
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
        return {users, totalCount};
    };
}
