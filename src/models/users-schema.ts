export const usersSchemaObject = {
    _id: String,
    userName: {type: String, required: true},
    firstName: String,
    lastName: String,
    profilePicture: String,
    email: {type: String, required: true},
    passwordHash: {type: String, required: true},
    isPublic: {type: Boolean, required: true, default: false},
    bio: String,
};
