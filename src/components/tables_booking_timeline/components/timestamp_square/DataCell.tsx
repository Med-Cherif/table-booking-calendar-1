import { ReactNode, useRef, useState } from 'react';
import './style/index.scss';
import { Overlay, Tooltip } from 'react-bootstrap';
import {
  useEventsStore,
  useFocusedTimestamp,
} from '../../../../store/eventsStore';
interface DataCellProps {
  children?: ReactNode;
  onClick?: () => void;
  tooltip?: ReactNode;
  index: number;
}
export default function DataCell({
  children,
  onClick,
  index,
  tooltip,
}: DataCellProps) {
  const focused = useFocusedTimestamp();
  const onHover = (value: boolean) => {
    useEventsStore.getState().setFocusedCapacity(value ? index : -1);
  };
  const ref = useRef<HTMLDivElement | null>(null);
  const [showTip, setShowTip] = useState(false);
  return (
    <>
      <div
        className={'data-cell'}
        onMouseEnter={onHover ? () => onHover(true) : undefined}
        onMouseOut={onHover ? () => onHover(false) : undefined}
      >
        <div
          className={'data-cell-content' + (focused == index ? ' focus' : '')}
          ref={ref}
          onClick={onClick}
          onMouseOver={() => setShowTip(true)}
          onMouseOut={() => setShowTip(false)}
        ></div>
        {children}
      </div>
      {tooltip && (
        <Overlay target={ref.current} show={showTip} placement="bottom">
          <Tooltip>{tooltip}</Tooltip>
        </Overlay>
      )}
    </>
  );
}
