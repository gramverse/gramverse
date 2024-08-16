export const generateResetToken = () => {
    let result = "";
    const tokenLength = 32;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for (let i=0; i<tokenLength; i++) {
        const newChar = chars.charAt(Math.floor(Math.random() * chars.length));
        result += newChar;
    }
    return result;
}