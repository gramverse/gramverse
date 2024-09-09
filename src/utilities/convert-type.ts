export const convertType = <T, D extends Document&T> (objectWithDocument: D|undefined): T|undefined => {
    if (!objectWithDocument) {
        return;
    }
    const objectWithoutDocument: T = objectWithDocument;
    return objectWithoutDocument;
}