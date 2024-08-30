export class HttpError extends Error {
    constructor(public statusCode: number, public errorCode: number, public message: string) {
        super();
    }
}
