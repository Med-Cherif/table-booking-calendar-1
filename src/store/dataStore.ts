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
              capacity: 6,
              reservations: [
                {
                  id: 1,
                  start: '10:00',
                  end: '11:45',
                  capacity: 2,
                  name: 'Reservation A',
                },
                {
                  id: 2,
                  start: '12:00',
                  end: '13:45',
                  capacity: 2,
                  name: 'Reservation B',
                },
              ],
            },
            {
              id: 2,
              name: 'Table B',
              capacity: 8,
              reservations: [
                {
                  id: 8,
                  start: '10:00',
                  end: '11:00',
                  capacity: 10,
                  name: 'Reservation F',
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
              capacity: 6,
              reservations: [
                {
                  id: 3,
                  start: '17:00',
                  end: '18:45',
                  capacity: 2,
                  name: 'Reservation C',
                },
                {
                  id: 4,
                  start: '13:00',
                  end: '14:45',
                  capacity: 2,
                  name: 'Reservation D',
                },
              ],
            },
            {
              id: 4,
              name: 'Table D',
              capacity: 8,
              reservations: [
                {
                  id: 5,
                  start: '15:00',
                  end: '16:00',
                  capacity: 10,
                  name: 'Reservation E',
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
                    (reservation) => reservation.id === change.reservation.id,
                  ),
                ),
              )
              ?.tables.find((table) =>
                table.reservations.find(
                  (reservation) => reservation.id === change.reservation.id,
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
              (reservation) => reservation.id === change.reservation.id,
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
