import { Model } from "mongoose";
import { IEvent } from "../models/notification/event";
import { eventSchema } from "../models/notification/event-schema";

export class eventsRepository {
    private events : Model<IEvent>;
    constructor(private dataHandler : typeof import ("mongoose")) {
        this.events = dataHandler.model<IEvent>("events", eventSchema);
    }
}