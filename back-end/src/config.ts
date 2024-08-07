import mongoose from "mongoose";
import {UserRepository} from "./repository/user.repository";
import {UserService} from "./services/user.service";

export const userRepository = new UserRepository(mongoose);
export const userService = new UserService(userRepository);
