import {PostDetailDto} from "./post-detail-dto";

export type ExplorePostDto = PostDetailDto & {
    profileImage: string;
    followerCount: number;
};
