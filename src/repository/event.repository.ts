import { Model } from "mongoose";
import { IEvent } from "../models/notification/event";
import { eventSchema } from "../models/notification/event-schema";

export class EventRepository {
    private events : Model<IEvent>;
    constructor(private dataHandler : typeof import ("mongoose")) {
        this.events = dataHandler.model<IEvent>("events", eventSchema);
    }

    getEventById = async (_id: string) => {
        return (await this.events.findById(_id))||undefined;
    }
}