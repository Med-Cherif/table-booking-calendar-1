import { useDroppable } from '@dnd-kit/core';
import './style/index.scss';
import {
  ChangeType,
  HourMinute,
  Reservation,
  Table,
} from '../../../../types/types';
import DataCell from '../data_cell';
import DragableResizableItem from '../dragable_resizable_item';
interface RoomTableProps {
  table: Table;
  row: number;
  noNameText: string;
  rangeList: HourMinute[];
  onReservationChange?: (change: ChangeType) => void;
  onEmptyCellClick?: (timeIndex: number) => void;
  reservationColor?: (reservation: Reservation) => string;
  reservationModal?: (
    reservation: Reservation,
    close: () => void,
  ) => React.ReactNode;
  onReservationClick?: (reservation: Reservation) => void;
}

export default function RoomTable({
  table,
  row,
  rangeList,
  noNameText,
  onReservationChange,
  onEmptyCellClick,
  reservationModal,
  reservationColor,
  onReservationClick,
}: RoomTableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: table.id.toString(),
  });
  return (
    <tr className="room-table" key={table.id} ref={setNodeRef}>
      <td style={{ fontWeight: isOver ? 700 : undefined }}>
        {table.name}
        {'(' + table.seats + ')'}
      </td>
      {rangeList.map(({ hour, minute }, index) => {
        let diff;
        let diffResult = 0;
        let diffEndResult = 0;
        const reservation = table.reservations.find(({ time, id }) => {
          const [reservationHour, reservationMinutes] = time.split(':');
          diff = +reservationMinutes - +minute;
          if (reservationHour === hour && diff <= 14 && diff >= 0) {
            diffResult = diff;
            return true;
          }
          return false;
          // return reservationHour === hour && diff <= 14 && diff >= 0;
        });
        let endTime: any, factor;
        let diffEnd: number;
        if (reservation) {
          endTime = reservation.end.split(':');
          const [bookingEndHour, bookingEndMinutes] = endTime;
          const idx =
            rangeList.findIndex(({ hour: h, minute: m }) => {
              diffEnd = +bookingEndMinutes - +m;
              if (h === bookingEndHour && diffEnd <= 14 && diffEnd >= 0) {
                diffEndResult = diffEnd;
                return true;
                // return h === bookingEndHour && diffEnd <= 14 && diffEnd >= 0;
              }
              return false;
            }) - index;
          if (idx >= 0) {
            factor = idx;
          } else {
            factor = rangeList.length - index;
          }
        }

        return (
          <td key={index} className="table-item">
            <DataCell
              index={index}
              pair={Math.floor(index / 4) % 2 == 0}
              row={row}
              onClick={() => onEmptyCellClick?.(index)}
            >
              {reservation && (
                <DragableResizableItem
                  rangeList={rangeList}
                  noNameText={noNameText}
                  tableId={table.id}
                  diffResult={diffResult}
                  reservationColor={reservationColor}
                  diffEndResult={diffEndResult}
                  onDoubleClick={() => onReservationClick?.(reservation)}
                  modal={(close) => reservationModal?.(reservation, close)}
                  reservation={reservation}
                  factor={factor ?? 1}
                  onResized={(f, time) => {
                    (onReservationChange as any)?.({
                      from: f,
                      type: 'resized',
                      newEndTime: time,
                      newStartTime: time,
                      reservation,
                      reservations: table.reservations,
                    });
                  }}
                />
              )}
            </DataCell>
          </td>
        );
      })}
    </tr>
  );
}
