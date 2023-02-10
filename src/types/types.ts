export interface Reservation {
  id: number;
  start: string;
  end: string;
  capacity: number;
  name: string;
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
