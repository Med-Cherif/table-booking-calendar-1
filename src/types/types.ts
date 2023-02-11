export interface Reservation {
  id: number;
  start: string;
  end: string;
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
  guestsCount: number;
  reservationGuests: number;
  reservationCount: number;
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
