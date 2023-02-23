export interface Reservation {
  id: number;
  time: string;
  end: string; //"08:55" format(newDate,"HH:mm")
  persons: number;
  name: string;
  color?: string;
  lock_tables: boolean;
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
  seats: number;
  reservations: Reservation[];
}
export interface Room {
  id: number;
  name: string;
  tables: Table[];
}

export type ChangeType = (
  | { type: 'resized'; newEndTime: string; reservations: Reservation[] }
  | { type: 'moved'; newTableId: number; prevTableId: number; newTimeStart: string; end: string; }
) & { reservation: Reservation };
