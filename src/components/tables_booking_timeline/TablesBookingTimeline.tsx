import { Fragment } from 'react';
import CapacityCell from './components/capacity_square';
import './style/index.scss';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { isWithinInterval, parse, subMinutes } from 'date-fns';
import { ChangeType, Reservation, Room } from '../../types/types';
import { rangeToTime } from '../../helpers/time.helper';
import RoomTable from './components/room_table';

function calculateCapacity(
  data: Room[],
  time: { hour: string; minute: string },
) {
  let cap = 0;
  data.forEach(({ tables }) => {
    tables.forEach(({ reservations }) => {
      reservations.forEach(({ start, end, capacity }) => {
        const current = `${time.hour}:${time.minute}`;
        const currentDate = parse(current, 'HH:mm', new Date());
        const startDate = parse(start, 'HH:mm', new Date());
        const endDate = subMinutes(parse(end, 'HH:mm', new Date()), 1);
        if (isWithinInterval(currentDate, { start: startDate, end: endDate }))
          cap += capacity;
      });
    });
  });
  return cap;
}
interface TablesBookingTimelineProps {
  data: Room[];
  timeRange: { startHour: number; endHour: number; step: number };
  lockedTime: string[];
  cellTooltip?: (time: string) => React.ReactNode;
  reservationTooltip?: (reservation: Reservation) => React.ReactNode;
  reservationModal?: (
    reservation: Reservation,
    close: () => void,
  ) => React.ReactNode;
  capacityModal?: (time: string, close: () => void) => React.ReactNode;
  onEmptyCellClick?: (time: string) => void;
  onReservationChange?: (change: ChangeType) => void;
}

export default function TablesBookingTimeline({
  data,
  timeRange,
  lockedTime,
  reservationTooltip,
  onReservationChange,
  cellTooltip,
  onEmptyCellClick,
  reservationModal,
  capacityModal,
}: TablesBookingTimelineProps) {
  const rangeList = rangeToTime(
    timeRange.startHour,
    timeRange.endHour,
    timeRange.step,
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  return (
    <div className="tables-booking-timeline">
      <DndContext
        sensors={sensors}
        onDragEnd={(e) => {
          if (e.over?.id == undefined) {
            // console.log(`reservation ${e.active.id} dropped into nowhere`);
            return;
          }

          // console.log(
          //   `reservation ${e.active.id} dropped into table ${e.over?.id}`,
          // );
          onReservationChange?.({
            type: 'moved',
            newTableId: Number(e.over.id),
            reservation: e.active.data.current as any,
          });
        }}
      >
        <table>
          <tbody>
            <tr className="timeline">
              <td></td>
              {rangeList.map(({ minute, hour }, index) =>
                minute === '00' ? (
                  <td key={index} className="timeline-hour">
                    <span>{hour}</span>
                  </td>
                ) : (
                  <td key={index}></td>
                ),
              )}
            </tr>
            <tr className="capacity">
              <td>Capacity</td>
              {rangeList.map((time, index) => {
                const isLocked = lockedTime.includes(
                  `${time.hour}:${time.minute}`,
                );
                return (
                  <td key={index}>
                    <CapacityCell
                      index={index}
                      capacity={calculateCapacity(data, time)}
                      isLocked={isLocked}
                      tooltip={cellTooltip?.(`${time.hour}:${time.minute}`)}
                      modal={(close) =>
                        capacityModal?.(`${time.hour}:${time.minute}`, close)
                      }
                    />
                  </td>
                );
              })}
            </tr>
            {data.map((room) => (
              <Fragment key={room.id}>
                <tr className="room" key={room.id}>
                  <td>{room.name}</td>
                </tr>
                {room.tables.map((table) => (
                  <RoomTable
                    key={table.id}
                    table={table}
                    rangeList={rangeList}
                    reservationTooltip={reservationTooltip}
                    onReservationChange={onReservationChange}
                    cellTooltip={cellTooltip}
                    onEmptyCellClick={onEmptyCellClick}
                    reservationModal={reservationModal}
                  />
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
