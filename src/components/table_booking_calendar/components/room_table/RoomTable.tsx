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
  rangeList: HourMinute[];
  onReservationChange?: (change: ChangeType) => void;
  onEmptyCellClick?: (timeIndex: number) => void;
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
  onReservationChange,
  onEmptyCellClick,
  reservationModal,
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
          factor =
            rangeList.findIndex(({ hour: h, minute: m }) => {
              diffEnd = +bookingEndMinutes - +m;
              if (h === bookingEndHour && diffEnd <= 14 && diffEnd >= 0) {
                diffEndResult = diffEnd;
                return true;
                // return h === bookingEndHour && diffEnd <= 14 && diffEnd >= 0;
              }
              return false;
            }) - index;
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
                  tableId={table.id}
                  diffResult={diffResult}
                  diffEndResult={diffEndResult}
                  onDoubleClick={() => onReservationClick?.(reservation)}
                  modal={(close) => reservationModal?.(reservation, close)}
                  reservation={reservation}
                  factor={factor ?? 1}
                  onResized={(f, timeEnd) => {
                    const newEndTime = rangeList[index + f];
                    const [h, m] = timeEnd.split(':');
                    onReservationChange?.({
                      type: 'resized',
                      newEndTime: `${h}:${m}`,
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
