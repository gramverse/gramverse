import { Model } from "mongoose";
import { IEvent } from "../models/notification/event";
import { eventSchema } from "../models/notification/event-schema";
import { AddEventRequest } from "../models/notification/add-event-request";

export class eventsRepository {
    private events : Model<IEvent>;
    constructor(private dataHandler : typeof import ("mongoose")) {
        this.events = dataHandler.model<IEvent>("events", eventSchema);
    }

    add = async (addEventRequest: AddEventRequest ) =>{
        const createdEvent = await this.events.create(addEventRequest);
        if (!createdEvent) {
            return undefined;
        }
        const newEvent: Event = createdEvent;
        return newEvent;
    }
}
