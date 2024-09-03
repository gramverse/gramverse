
export interface IEvent extends Document {
    _id: string,
    performerUserName: string,
    targetUserName: string,
    eventType: string,
    creationDate: Date,
    updateDate: Date,
}

export interface Event {
    _id: string,
    performerUserName: string,
    targetUserName: string,
    eventType: string,
    creationDate: Date,
    updateDate: Date,
}