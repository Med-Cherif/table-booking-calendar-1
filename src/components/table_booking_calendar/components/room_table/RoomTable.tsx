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
        const reservation = table.reservations.find(
          ({ time }) => time == `${hour}:${minute}`,
        );
        let endTime: any, factor;
        if (reservation) {
          endTime = reservation.end.split(':');
          factor =
            rangeList.findIndex(
              ({ hour: h, minute: m }) =>
                h == endTime?.[0] && m == endTime?.[1],
            ) - index;
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
                  tableId={table.id}
                  onDoubleClick={() => onReservationClick?.(reservation)}
                  modal={(close) => reservationModal?.(reservation, close)}
                  reservation={reservation}
                  factor={factor ?? 1}
                  onResized={(f) => {
                    const newEndTime = rangeList[index + f];
                    onReservationChange?.({
                      type: 'resized',
                      newEndTime: `${newEndTime.hour}:${newEndTime.minute}`,
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
