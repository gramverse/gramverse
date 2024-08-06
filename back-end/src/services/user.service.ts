import {UserRepository} from "../repository/user.repository";

export class UserService {
    constructor(private userRepository: UserRepository) {}
}