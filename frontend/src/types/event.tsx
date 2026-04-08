type EventMode =
  | "SingleOption"
  | "CollaborativeOptions"
  | "OrganizerOptions"
  | "FixedTimeOpenPlace"
  | "FixedPlaceOpenTime"
  | "FullyOpen";

type EventPhase = "Proposal" | "FinalVoting" | "Closed";

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
  cancelledReason?: string;
}
export default Event;
