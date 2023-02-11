/* eslint-disable @typescript-eslint/no-unused-vars */
import { Overlay } from 'react-bootstrap';
import './style/index.scss';
import {
  useEventsStore,
  useFocusedCapacity,
} from '../../../../store/eventsStore';
import { ReactNode, useRef, useState } from 'react';
import ModalTip from '../modal_tip';
import { TimeBlock } from '../../../../types/types';
interface CapacityCellProps {
  index: number;
  timeBlock: TimeBlock;
  isLocked?: boolean;
  modal?: (close: () => void) => ReactNode;
}
export default function CapacityCell({
  timeBlock,
  index,
  isLocked,
  modal,
}: CapacityCellProps) {
  const focus = useFocusedCapacity();
  const onHover = (value: boolean) => {
    useEventsStore.getState().setFocusedTimestamp(value ? index : -1);
  };
  const ref = useRef<HTMLDivElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => {
    setShowModal(false);
  };
  return (
    <>
      <div
        className={
          'capacity-cell' +
          (focus == index ? ' focus' : '') +
          (isLocked ? ' locked' : '')
        }
        ref={ref}
        onMouseEnter={() => {
          onHover?.(true);
        }}
        onMouseLeave={() => {
          onHover?.(false);
        }}
        onClick={() => {
          setShowModal(true);
        }}
        id={`capacity-cell-${index}`}
      >
        <span>{timeBlock.reservationCount}</span>
      </div>

      {modal && (
        <Overlay target={ref.current} show={showModal} placement="bottom">
          {({
            placement,
            arrowProps,
            show: _show,
            popper,
            ref: reference,
            ...props
          }) => (
            <ModalTip onClose={handleClose} props={props} ref={reference}>
              {modal(handleClose)}
            </ModalTip>
          )}
        </Overlay>
      )}
    </>
  );
}
