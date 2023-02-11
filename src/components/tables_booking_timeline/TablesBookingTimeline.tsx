import { Fragment, useMemo, useRef } from 'react';
import CapacityCell from './components/capacity_cell';
import './style/index.scss';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { isWithinInterval, parse, subMinutes } from 'date-fns';
import {
  ChangeType,
  Reservation,
  Room,
  TimeBlock,
  TimeRange,
} from '../../types/types';
import { rangeToTime } from '../../helpers/time.helper';
import RoomTable from './components/room_table';
import { useEventsStore } from '../../store/eventsStore';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import TimeIndicator from './components/time_indicator';

function calculateCapacity(
  data: Room[],
  time: { hour: string; minute: string },
): TimeBlock {
  let guestsCount = 0;
  let reservationCount = 0;
  let reservationGuests = 0;
  data.forEach(({ tables }) => {
    tables.forEach(({ reservations }) => {
      reservations.forEach(({ start, end, capacity }) => {
        const current = `${time.hour}:${time.minute}`;
        const currentDate = parse(current, 'HH:mm', new Date());
        const startDate = parse(start, 'HH:mm', new Date());
        const endDate = subMinutes(parse(end, 'HH:mm', new Date()), 1);
        if (start == current) {
          reservationGuests += capacity;
          reservationCount++;
        }

        if (isWithinInterval(currentDate, { start: startDate, end: endDate }))
          guestsCount += capacity;
      });
    });
  });
  return {
    guestsCount,
    reservationCount,
    reservationGuests,
    time: `${time.hour}:${time.minute}`,
  };
}
interface TablesBookingTimelineProps {
  data: Room[];
  timeRange: TimeRange;
  lockedTime: string[];
  cellTooltip?: (time: TimeBlock) => React.ReactNode;
  reservationTooltip?: (reservation: Reservation) => React.ReactNode;
  reservationModal?: (
    reservation: Reservation,
    close: () => void,
  ) => React.ReactNode;
  capacityModal?: (time: TimeBlock, close: () => void) => React.ReactNode;
  onEmptyCellClick?: (time: TimeBlock) => void;
  onReservationChange?: (change: ChangeType) => void;
  onReservationClick?: (reservation: Reservation) => void;
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
  onReservationClick,
}: TablesBookingTimelineProps) {
  const rangeList = useMemo(
    () => rangeToTime(timeRange.startHour, timeRange.endHour, timeRange.step),
    [timeRange],
  );
  const tableCount = useMemo(
    () => data.reduce((acc, { tables }) => acc + tables.length, 0),
    [data],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const isResizing = useEventsStore((event) => event.isResizing);
  const isDraging = useEventsStore((event) => event.isDraging);
  const lockedMovingRef = useRef(false);
  const timeBlocks = useMemo(
    () => rangeList.map((time) => calculateCapacity(data, time)),
    [data, rangeList],
  );
  return (
    <div
      className="tables-booking-timeline"
      style={
        isDraging || isResizing
          ? {
              cursor: lockedMovingRef.current
                ? 'no-drop'
                : isDraging
                ? 'move'
                : 'e-resize',
            }
          : undefined
      }
    >
      <DndContext
        onDragStart={(e) => {
          //is reservation is locked, don't allow drag
          if (e?.active?.data?.current?.isLocked) {
            lockedMovingRef.current = true;
          } else lockedMovingRef.current = false;
          useEventsStore.getState().setIsDraging(true);
        }}
        sensors={sensors}
        onDragEnd={(e) => {
          lockedMovingRef.current = false;
          useEventsStore.getState().setIsDraging(false);

          if (e.over?.id != undefined)
            onReservationChange?.({
              type: 'moved',
              newTableId: Number(e.over.id),
              reservation: e.active.data.current as any,
            });
        }}
      >
        <table
          style={
            isDraging || isResizing ? { pointerEvents: 'none' } : undefined
          }
        >
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
                      timeBlock={timeBlocks[index]}
                      isLocked={isLocked}
                      modal={(close) =>
                        capacityModal?.(timeBlocks[index], close)
                      }
                    />
                  </td>
                );
              })}
            </tr>
            {data.map((room, ind) => {
              const bookingCount = room.tables.reduce(
                (acc, table) => acc + table.reservations.length,
                0,
              );
              const reservationCapacity = room.tables.reduce(
                (acc, table) =>
                  acc +
                  table.reservations.reduce(
                    (ac, reservation) => ac + reservation.capacity,
                    0,
                  ),
                0,
              );

              let tableBefore = 0;
              for (let i = 0; i < ind; i++) {
                tableBefore += data[i].tables.length;
              }
              return (
                <Fragment key={room.id}>
                  <tr className="room" key={room.id}>
                    <td className={'room-details'}>{room.name}</td>
                    <td className="room-info">
                      {reservationCapacity} guests ,{bookingCount} bookings
                    </td>
                  </tr>
                  {room.tables.map((table, index) => {
                    return (
                      <RoomTable
                        row={index + tableBefore}
                        key={table.id}
                        table={table}
                        rangeList={rangeList}
                        onReservationChange={onReservationChange}
                        onEmptyCellClick={(tIndex) =>
                          onEmptyCellClick?.(timeBlocks[tIndex])
                        }
                        reservationModal={reservationModal}
                        onReservationClick={onReservationClick}
                      />
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </DndContext>
      <TimeIndicator timeRange={timeRange} />
      <div className="tooltips">
        {rangeList.map((time, index) => (
          <Tooltip
            key={index}
            style={{ zIndex: 99, position: 'absolute' }}
            anchorId={`capacity-cell-${index}`}
            place="bottom"
            delayShow={200}
          >
            {cellTooltip?.(timeBlocks[index])}
          </Tooltip>
        ))}
        {data.map((room) => (
          <Fragment key={room.id}>
            {room.tables.map((table) => (
              <Fragment key={table.id}>
                {table.reservations.map((reservation) => (
                  <Tooltip
                    key={reservation.id}
                    style={{ zIndex: 99, position: 'absolute' }}
                    anchorId={`reservation-${reservation.id}`}
                    place="bottom"
                    delayShow={200}
                  >
                    {reservationTooltip?.(reservation)}
                  </Tooltip>
                ))}
              </Fragment>
            ))}
          </Fragment>
        ))}
        {Array.from({ length: tableCount }).map((_, row) => (
          <Fragment key={row}>
            {rangeList.map((time, index) => {
              return (
                <Tooltip
                  key={index}
                  style={{ zIndex: 99, position: 'absolute' }}
                  anchorId={`data-cell-${index}-${row}`}
                  place="bottom"
                  delayShow={200}
                >
                  {cellTooltip?.(timeBlocks[index])}
                </Tooltip>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
