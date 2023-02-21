import { Fragment, useEffect, useMemo, useRef } from 'react';
import CapacityCell from './components/capacity_cell';
import './style/index.scss';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
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
import { calculateTimeBlock } from '../../helpers/math.helper';

interface TableBookingCalendarProps {
  data: Room[];
  timeRange: TimeRange;
  lockedTime: string[];
  times: string[];
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

export default function TableBookingCalendar({
  data = [],
  timeRange,
  times = [],
  lockedTime = [],
  reservationTooltip,
  onReservationChange,
  cellTooltip,
  onEmptyCellClick,
  reservationModal,
  capacityModal,
  onReservationClick,
}: TableBookingCalendarProps) {
  const rangeList = useMemo(() => rangeToTime(times), [times]);
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
    () => rangeList.map((time) => calculateTimeBlock(data, time)),
    [data, rangeList],
  );

  useEffect(() => {
    console.log('Version 1');
  }, []);

  return (
    <div
      className="table-booking-calendar"
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
          if (e?.active?.data?.current?.lock_tables) {
            lockedMovingRef.current = true;
          } else lockedMovingRef.current = false;
          useEventsStore.getState().setIsDraging(true);
        }}
        sensors={sensors}
        onDragEnd={(e) => {
          lockedMovingRef.current = false;
          useEventsStore.getState().setIsDraging(false);

          if (e.over?.id != undefined) {
            const [prevTableId] = e.active.id.toString().split('-');
            onReservationChange?.({
              prevTableId: +prevTableId,
              type: 'moved',
              newTableId: Number(e.over.id),
              reservation: e.active.data.current as any,
            });
          }
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
              <td></td>
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
                    (ac, reservation) => ac + reservation.persons,
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
        {rangeList.map((_, index) => (
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
            {rangeList.map((__, index) => {
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
