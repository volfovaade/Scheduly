import EventMode from "./eventMode";
import EventPhase from "./eventPhase";

interface Event {
    id: string;
    title: string;
    description: string;
    code: string;
    mode: EventMode;
    phase: EventPhase;
    isMultiDay: boolean;
    timeRangeFrom: Date | null;
    timeRangeTo: Date | null;
    fixedPlaceName: string | null;
    fixedAddress: string | null;
    fixedTimeFrom: Date | null;
    fixedTimeTo: Date | null;
    finalPlaceName: string | null;
    finalAddress: string | null;
    finalTimeFrom: string | null;
    finalTimeTo: string | null;
    currentUserIsOrganizer: boolean;
    allowParticipantOptions: boolean;
    participants: any[];
}
export default Event;
