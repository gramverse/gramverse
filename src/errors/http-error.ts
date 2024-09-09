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

export class UnknownError extends HttpError {
    constructor(public message: string = "Unknown error") {
        super(500, ErrorCode.UNKNOWN_ERROR, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(public objectType: "page" | "user" | "post") {
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
        }
        const tempMessage = `${objectType} not found`;
        super(404, tempErrorCode, tempMessage);
    }
}
