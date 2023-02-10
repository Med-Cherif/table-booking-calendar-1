/* eslint-disable @typescript-eslint/no-unused-vars */
import { Overlay, Tooltip } from 'react-bootstrap';
import './style/index.scss';
import {
  useEventsStore,
  useFocusedCapacity,
} from '../../../../store/eventsStore';
import { ReactNode, useRef, useState } from 'react';
import ModalTip from '../modal_tip';
interface CapacityCellProps {
  index: number;
  capacity: number;
  isLocked?: boolean;
  modal?: (close: () => void) => ReactNode;
  tooltip?: ReactNode;
}
export default function CapacityCell({
  capacity,
  index,
  isLocked,
  modal,
  tooltip,
}: CapacityCellProps) {
  const focus = useFocusedCapacity();
  const onHover = (value: boolean) => {
    useEventsStore.getState().setFocusedTimestamp(value ? index : -1);
  };
  const ref = useRef<HTMLDivElement | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => {
    setShowModal(false);
  };
  return (
    <>
      <div
        className={
          'capacity-square' +
          (focus == index ? ' focus' : '') +
          (isLocked ? ' locked' : '')
        }
        ref={ref}
        onMouseOver={() => {
          onHover?.(true);
          setShowTip(true);
        }}
        onMouseOut={() => {
          onHover?.(false);
          setShowTip(false);
        }}
        onClick={() => {
          setShowModal(true);
        }}
      >
        <span>{capacity}</span>
      </div>
      {tooltip && (
        <Overlay target={ref.current} show={showTip} placement="bottom">
          <Tooltip>{tooltip}</Tooltip>
        </Overlay>
      )}
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
