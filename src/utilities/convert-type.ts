export const convertType = <T, D extends Document & T>(
    objectWithDocument: D | undefined | null,
): T | undefined => {
    if (!objectWithDocument) {
        return;
    }
    const objectWithoutDocument: T = objectWithDocument;
    return objectWithoutDocument;
};

export const convertTypeForArray = <T, D extends Document & T>(
    objectWithDocument: D[],
): T[] => {
    const result: T[] = [];
    for (const o of objectWithDocument) {
        const objectWithoutDocument: T = o;
        result.push(o);
    }
    return result;
};
