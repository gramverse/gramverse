import {Model} from "mongoose";
import {Event, IEvent} from "../models/notification/event";
import {eventSchema} from "../models/notification/event-schema";
import {AddEventRequest} from "../models/notification/add-event-request";

export class EventRepository {
    private events: Model<IEvent>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.events = dataHandler.model<IEvent>("events", eventSchema);
    }

    getEventById = async (_id: string) => {
        return (await this.events.findById(_id)) || undefined;
    };
    add = async (performerUserName: string, targetId: string, type: string) => {
        const createdEvent = await this.events.create({
            performerUserName,
            targetId,
            type,
        });
        if (!createdEvent) {
            return undefined;
        }
        return createdEvent._id;
    };
    deleteEvent = async (eventId: string) => {
        const deleteResult = await this.events.deleteOne({_id: eventId});
        return deleteResult.acknowledged;
    };
    getEvent = async (performerUserName: string, targetId: string) => {
        return (
            (await this.events.findOne({performerUserName, targetId})) ||
            undefined
        );
    };
}
