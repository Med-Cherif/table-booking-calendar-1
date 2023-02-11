import { ReactNode, useRef } from 'react';
import './style/index.scss';
import {
  useEventsStore,
  useFocusedTimestamp,
} from '../../../../store/eventsStore';
interface DataCellProps {
  children?: ReactNode;
  onClick?: () => void;
  index: number;
  row: number;
  pair?: boolean;
}
export default function DataCell({
  children,
  onClick,
  index,
  row,
  pair,
}: DataCellProps) {
  const focused = useFocusedTimestamp();
  const onHover = (value: boolean) => {
    useEventsStore.getState().setFocusedCapacity(value ? index : -1);
  };
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <div
        className={'data-cell'}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <div
          className={'data-cell-content' + (focused == index ? ' focus' : '')}
          ref={ref}
          onClick={onClick}
          id={`data-cell-${index}-${row}`}
          style={{ backgroundColor: !pair ? 'white' : '#f7f7f7' }}
        ></div>
        {children}
      </div>
    </>
  );
}
/*
// - Locked reservations 
// - Double click reservation
// - Room text style and info
// - color
// - grid style*

*/
