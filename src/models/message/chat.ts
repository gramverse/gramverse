export interface IChat extends Chat, Document {}

export interface Chat {
    _id: string;
    userName1: String,
    userName2: String,
    lastContent: String,
    lastType: String, 
    lastUserName: String, 
    creationDate: Date,
    lastUpdated: Date
}

