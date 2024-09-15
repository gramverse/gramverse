import {Model} from "mongoose";
import {Event, IEvent} from "../models/notification/event";
import {eventSchema} from "../models/notification/event-schema";
import {AddEventRequest} from "../models/notification/add-event-request";
import {convertType} from "../utilities/convert-type";

export class EventRepository {
    private events: Model<IEvent>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.events = dataHandler.model<IEvent>("events", eventSchema);
    }

    getEventById = async (_id: string) => {
        const event = await this.events.findById(_id);
        return convertType<Event, IEvent>(event);
    };

    add = async (performerUserName: string, targetId: string, type: string) => {
        const createdEvent = await this.events.create({
            performerUserName,
            targetId,
            type,
        });
        return createdEvent._id;
    };

    deleteEvent = async (eventId: string) => {
        await this.events.deleteOne({_id: eventId});
    };

    getEvent = async (performerUserName: string, targetId: string) => {
        const event = await this.events.findOne({performerUserName, targetId});
        return convertType<Event, IEvent>(event);
    };

    getAllEvents = async () => {
        return await this.events.find();
    }
}
