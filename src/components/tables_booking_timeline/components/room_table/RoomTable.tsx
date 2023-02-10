import { useDroppable } from '@dnd-kit/core';
import './style/index.scss';
import { ChangeType, Reservation, Table } from '../../../../types/types';
import DataCell from '../timestamp_square';
import DragableResizableItem from '../resizable_button';
interface RoomTableProps {
  table: Table;
  rangeList: { minute: string; hour: string }[];
  reservationTooltip?: (reservation: Reservation) => React.ReactNode;
  onReservationChange?: (change: ChangeType) => void;
  cellTooltip?: (time: string) => React.ReactNode;
  onEmptyCellClick?: (time: string) => void;
  reservationModal?: (
    reservation: Reservation,
    close: () => void,
  ) => React.ReactNode;
}

export default function RoomTable({
  table,
  rangeList,
  reservationTooltip,
  onReservationChange,
  cellTooltip,
  onEmptyCellClick,
  reservationModal,
}: RoomTableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: table.id.toString(),
  });
  return (
    <tr
      className="room-table"
      key={table.id}
      ref={setNodeRef}
      style={{ color: isOver ? 'green' : undefined }}
    >
      <td>
        {table.name}
        {'(' + table.capacity + ')'}
      </td>
      {rangeList.map(({ hour, minute }, index) => {
        const reservation = table.reservations.find(
          ({ start }) => start == `${hour}:${minute}`,
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
              tooltip={cellTooltip?.(`${hour}:${minute}`)}
              onClick={() => onEmptyCellClick?.(`${hour}:${minute}`)}
            >
              {reservation && (
                <DragableResizableItem
                  modal={(close) => reservationModal?.(reservation, close)}
                  reservation={reservation}
                  tooltip={reservationTooltip?.(reservation)}
                  factor={factor ?? 1}
                  onResized={(f) => {
                    const newEndTime = rangeList[index + f];
                    // console.log(
                    //   `reservation ${reservation.id} resized to ${newEndTime.hour}:${newEndTime.minute}`,
                    // );
                    onReservationChange?.({
                      type: 'resized',
                      newEndTime: `${newEndTime.hour}:${newEndTime.minute}`,
                      reservation,
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
