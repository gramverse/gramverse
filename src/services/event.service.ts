import {EventRepository} from "../repository/event.repository";

export class EventService {
    constructor(private eventRepository: EventRepository) {}

    addEvent = async (
        performerUserName: string,
        targetId: string,
        type: string,
    ) => {
        return await this.eventRepository.add(
            performerUserName,
            targetId,
            type,
        );
    };

    deleteEvent = async (eventId: string) => {
        await this.eventRepository.deleteEvent(eventId);
    };

    getEventId = async (performerUserName: string, targetId: string) => {
        return (
            await this.eventRepository.getEvent(performerUserName, targetId)
        )?._id;
    };

    getEventById = async (eventId: string) => {
        return await this.eventRepository.getEventById(eventId);
    };

    getAllEvents = async () => {
        return await this.eventRepository.getAllEvents();
    }
}
