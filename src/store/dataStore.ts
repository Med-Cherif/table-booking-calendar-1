import { create } from 'zustand';
import { ChangeType, Room } from '../types/types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DataState {
  data: Room[];
  setData: (data: Room[]) => void;
  onChanges: (change: ChangeType) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      data: [
        {
          id: 1,
          name: 'Room A',
          tables: [
            {
              id: 1,
              name: 'Table A',
              seats: 6,
              reservations: [
                {
                  id: 1,
                  time: '10:00',
                  end: '11:45',
                  persons: 2,
                  name: 'Reservation A',
                  lock_tables: false,
                },
                {
                  id: 2,
                  time: '12:00',
                  end: '13:45',
                  persons: 2,
                  name: 'Reservation B',
                  lock_tables: true,
                },
              ],
            },
            {
              id: 2,
              name: 'Table B',
              seats: 8,
              reservations: [
                {
                  id: 8,
                  time: '10:00',
                  end: '11:00',
                  persons: 10,
                  name: 'Reservation F',
                  lock_tables: true,
                  color: 'red',
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: 'Room B',
          tables: [
            {
              id: 3,
              name: 'Table C',
              seats: 6,
              reservations: [
                {
                  id: 3,
                  time: '17:00',
                  end: '18:45',
                  persons: 2,
                  name: 'Reservation C',
                  lock_tables: false
                },
                {
                  id: 4,
                  time: '13:00',
                  end: '14:45',
                  persons: 2,
                  name: 'Reservation D',
                  lock_tables: false
                },
              ],
            },
            {
              id: 4,
              name: 'Table D',
              seats: 8,
              reservations: [
                {
                  id: 3,
                  time: '17:00',
                  end: '18:45',
                  persons: 2,
                  name: 'Reservation C',
                  lock_tables: false
                },
                {
                  id: 5,
                  time: '15:00',
                  end: '16:00',
                  persons: 10,
                  name: 'Reservation E',
                  lock_tables: false
                },
              ],
            },
          ],
        },
      ],
      setData: (data: Room[]) => set({ data }),
      onChanges: (change: ChangeType) => {
        if (change.type == 'resized') {
          const data = get().data.filter((room) =>
            room.tables.filter((table) =>
              table.reservations.map((reservation) => {
                if (reservation.id === change.reservation.id) {
                  reservation.end = change.newEndTime;
                }
                return reservation;
              }),
            ),
          );
          set({
            data,
          });
        }
        if (change.type == 'moved') {
          //get reservation table id
          const { data } = get();
          //find reservation table
          const reservationTable =
            data
              .find((room) =>
                room.tables.find((table) =>
                  table.reservations.find(
                    (reservation) => (reservation.id === change.reservation.id && change.prevTableId === table.id)
                  ),
                ),
              )
              ?.tables.find((table) =>
                table.reservations.find(
                  (reservation) => (reservation.id === change.reservation.id && change.prevTableId === table.id)
                ),
              )?.reservations ?? [];
          data
            .find((room) =>
              room.tables.find((table) => table.id === change.newTableId),
            )
            ?.tables.find((table) => table.id === change.newTableId)
            ?.reservations.push(change.reservation);
          reservationTable.splice(
            reservationTable.findIndex(
              (reservation) => (reservation.id === change.reservation.id)
            ),
            1,
          );
          set({ data });
        }
      },
    }),
    {
      name: 'data',
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
