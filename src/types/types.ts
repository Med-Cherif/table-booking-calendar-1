export interface Reservation {
  id: number;
  start: string;
  end: string; //"08:55" format(newDate,"HH:mm")
  capacity: number;
  name: string;
  color?: string;
  isLocked?: boolean;
}
export interface HourMinute {
  hour: string;
  minute: string;
}
export interface TimeBlock {
  time: string;
  guestsCount: number; //total guests count
  reservationGuests: number; //guests count for this reservation
  reservationCount: number; //total reservations count
}
export interface TimeRange {
  startHour: number;
  endHour: number;
  step: number;
}
export interface Table {
  id: number;
  name: string;
  capacity: number;
  reservations: Reservation[];
}
export interface Room {
  id: number;
  name: string;
  tables: Table[];
}

export type ChangeType = (
  | { type: 'resized'; newEndTime: string }
  | { type: 'moved'; newTableId: number }
) & { reservation: Reservation };
