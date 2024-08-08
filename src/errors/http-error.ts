export class HttpError extends Error {
    constructor(public statusCode: number, public errorCode: number, message?: string) {
        super(message);
        this.name = 'HttpError';
    }
}
