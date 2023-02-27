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
import { addMinutes, format, parse } from 'date-fns';

interface TableBookingCalendarProps {
  data: Room[];
  timeRange: TimeRange;
  lockedTime: string[];
  times: string[];
  noNameText: string;
  cellTooltip?: (time: TimeBlock) => React.ReactNode;
  reservationColor?: (reservation: Reservation) => string;
  reservationTooltip?: (reservation: Reservation) => React.ReactNode;
  reservationModal?: (
    reservation: Reservation,
    close: () => void,
  ) => React.ReactNode;
  capacityModal?: (time: TimeBlock, close: () => void) => React.ReactNode;
  onEmptyCellClick?: (time: TimeBlock, table: string | number) => void;
  onReservationChange?: (change: ChangeType) => void;
  onReservationClick?: (reservation: Reservation) => void;
}

export default function TableBookingCalendar({
  data = [],
  timeRange,
  times = [],
  lockedTime = [],
  noNameText = 'no name',
  reservationTooltip,
  onReservationChange,
  cellTooltip,
  reservationColor,
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

  // useEffect(() => {
  //   // console.log('Latest Version');
  // }, []);

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
            const { reservation, diffResult } = e.active.data.current!;
            const wtd =
              document.querySelector('.table-item')?.getClientRects()[0]
                ?.width ?? 0;
            const factor = Math.floor(Math.abs(e.delta.x) / wtd);
            const directionNumber = e.delta.x < 0 ? -1 : 1;
            const index = rangeList.findIndex((range) => {
              const { hour, minute } = range;
              const [h, m] = reservation.time.split(':');

              const diff = +m - +minute;
              if (h === hour && diff <= 14 && diff >= 0) {
                return true;
              }
              return false;
            });
            const timeIndex = factor * directionNumber + index;
            const { hour, minute } = rangeList[timeIndex];
            const timeStart = format(
              addMinutes(
                parse(`${hour}:${minute}`, 'HH:mm', new Date()),
                diffResult,
              ),
              'HH:mm',
            );
            const newData = {
              prevTableId: +prevTableId,
              type: 'moved',
              newTimeStart: timeStart,
              newTableId: Number(e.over.id),
              reservation,
            };
            onReservationChange?.(newData as any);
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
                        noNameText={noNameText}
                        row={index + tableBefore}
                        key={table.id}
                        rangeList={rangeList}
                        reservationColor={reservationColor}
                        table={table}
                        onReservationChange={onReservationChange}
                        onEmptyCellClick={(tIndex) =>
                          onEmptyCellClick?.(timeBlocks[tIndex], table.id)
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
