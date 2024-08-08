import {UserRepository} from "../repository/user.repository";

export interface IUserRepository {
    // add: (registerRequest: RegisterRequest) => Promise<User>;
    // checkEmailExistance: (email: string) => Promise<boolean>;
    // checkUserNameExistance: (userName: string) => Promise<boolean>;
    // getUserByEmail: (email: string) => Promise<User|undefined>;
    // getUserByUsername: (userName: string) => Promise<User|undefined>;
}

export class UserService {
    constructor(private userRepository: UserRepository) {}
}