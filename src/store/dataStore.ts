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
              reservations: [],
            },
            {
              id: 2,
              name: 'Table B',
              seats: 8,
              reservations: [],
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
                  id: 9,
                  time: '17:00',
                  end: '18:45',
                  persons: 2,
                  name: '',
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
