export interface IEvent extends Document {
    _id: string;
    performerUserName: string;
    targetId: string;
    type: string;
    creationDate: Date;
    updateDate: Date;
}

export interface Event {
    _id: string;
    performerUserName: string;
    targetId: string;
    type: string;
    creationDate: Date;
    updateDate: Date;
}
