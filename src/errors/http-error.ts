import {ErrorCode} from "./error-codes";

export class HttpError extends Error {
    constructor(
        public statusCode: number,
        public errorCode: number,
        public message: string,
    ) {
        super();
    }
}

export class LoginError extends HttpError {
    constructor(public message: string = "Username or password is incorrect") {
        super(401, ErrorCode.INVALID_USERNAME_OR_PASSWORD, message);
    }
}

export class AuthorizationError extends HttpError {
    constructor (public message: string = "Not authorized") {
        super(401, ErrorCode.UNAUTHORIZED, message);
    }
}

export class UnknownError extends HttpError {
    constructor(public message: string = "Unknown error") {
        super(500, ErrorCode.UNKNOWN_ERROR, message);
    }
}

type NotFoundObjectType = "page" | "user" | "post"|"comment";
export class NotFoundError extends HttpError {
    constructor(public objectType: NotFoundObjectType) {
        let tempErrorCode: ErrorCode;
        switch (objectType) {
            case "user":
                tempErrorCode = ErrorCode.USER_NOT_FOUND;
                break;
            case "post":
                tempErrorCode = ErrorCode.POST_NOT_FOUND;
                break;
            case "page":
                tempErrorCode = ErrorCode.PAGE_NOT_FOUND;
                break;
            case "comment":
                tempErrorCode = ErrorCode.COMMENT_NOT_FOUND;
                break;
        }
        const tempMessage = `${objectType} not found`;
        super(404, tempErrorCode, tempMessage);
    }
}

type MissingFieldName = "followingUserName"|"followerUserName"|"postId"|"commentId";
export class MissingFieldError extends HttpError {
    constructor(public fieldName: MissingFieldName) {
        let errorCode: number;
        switch (fieldName) {
            case "followingUserName":
                errorCode = ErrorCode.MISSING_FOLLOWING_USERNAME;
                break;
            case "followerUserName":
                errorCode = ErrorCode.MISSING_FOLLOWER_USERNAME;
                break;
            case "postId":
                errorCode = ErrorCode.MISSING_POSTID;
                break;
            case "commentId":
                errorCode = ErrorCode.MISSING_COMMENTID;
                break;
        }
        super(400, errorCode, `${fieldName} field is missing`);
    }
}

type InvalidFieldName = "userName"|"password"|"email"|"followingUserName"|"parentCommentId"|"accepted"|"postId";
export class ValidationError extends HttpError {
    constructor(public fieldName: InvalidFieldName) {
        let errorCode: number;
        switch (fieldName) {
            case "accepted":
                errorCode = ErrorCode.INVALID_ACCEPTED_ARGUMENT;
                break;
            case "email":
                errorCode = ErrorCode.INVALID_EMAIL;
                break;
            case "followingUserName":
                errorCode = ErrorCode.INVALID_FOLLOWING_USERNAME;
                break;
            case "parentCommentId":
                errorCode = ErrorCode.COMMENT_INVALID_PARENT_ID;
                break;
            case "password":
                errorCode = ErrorCode.INVALID_PASSWORD;
                break;
            case "userName":
                errorCode = ErrorCode.INVALID_USERNAME;
                break;
            case "postId":
                errorCode = ErrorCode.INVALID_POST_ID;
                break;
        }
        super(400, errorCode, `Invalid value for field ${fieldName}`);
    }
}

export class UploadFileError extends HttpError {
    constructor (public errorType: "large file size"|"unknown") {
        let errorCode: number;
        let message: string;
        switch (errorType) {
            case "large file size":
                errorCode = ErrorCode.FILE_TOO_LARGE;
                message = "Max file size = 4 MB";
                break;
            case "unknown":
                errorCode = ErrorCode.FILE_UPLOAD_ERROR;
                message = "an error occurred uploading file";
                break;
        }
        super(400, errorCode, message);
    }
}

type ForbiddenErrorType = "You are blocked"|"User is blocked by you"|"Edit post access denied"|"User is private"|"User is not followed";
export class ForbiddenError extends HttpError {
    constructor (public errorType: ForbiddenErrorType) {
        let errorCode: number;
        let message: string;
        switch (errorType) {
            case "Edit post access denied":
                errorCode = ErrorCode.EDIT_POST_ACCESS_DENIED;
                message = "you are not creator of this post";
                break;
            case "User is blocked by you":
                errorCode = ErrorCode.CREATOR_IS_BLOCKED_BY_YOU;
                message = "You have blocked creator of this post";
                break;
            case "User is not followed":
                errorCode = ErrorCode.USER_IS_NOT_FOLLOWED;
                message = "This user is not followed by you";
                break;
            case "User is private":
                errorCode = ErrorCode.USER_IS_PRIVATE;
                message = "This user is private";
                break;
            case "You are blocked":
                errorCode = ErrorCode.YOU_ARE_BLOCKED;
                message = "You are blocked by this user";
                break;
        }
        super(403, errorCode, message);
    }
}