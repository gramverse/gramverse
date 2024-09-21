export const sortString = (string1:string, string2: string) => {
    let result1: string, result2: string;
    if (string1.localeCompare(string2) > 0) {
        result1 = string2;
        result2 = string1;
    } else {
        result1 = string1;
        result2 = string2;
    }
    return {result1, result2};
}