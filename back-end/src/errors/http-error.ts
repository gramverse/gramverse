export class HttpError extends Error {
    constructor(public statusCode: number, public errorCode: number) {
        super();
    }
}
