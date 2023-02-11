/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import './style/index.scss';
import { Overlay } from 'react-bootstrap';
import { useDraggable } from '@dnd-kit/core';
import { useEventsStore } from '../../../../store/eventsStore';
import ModalTip from '../modal_tip';
import { Reservation } from '../../../../types/types';
import lock from '../../../../assets/icons/lock.svg';

interface DragableResizableItemProps {
  factor: number;
  onResized?: (factor: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  modal?: (close: () => void) => React.ReactNode;
  reservation: Reservation;
  onDoubleClick?: () => void;
}

const verticalDrag = (style: React.CSSProperties | undefined) =>
  style?.transform
    ? {
        ...style,
        transform: `translateY(${style.transform.split(',')[1]}`,
      }
    : style;

export default function DragableResizableItem({
  factor,
  onResized,
  reservation,
  modal,
  onDoubleClick,
}: DragableResizableItemProps) {
  const resizableRef = useRef<HTMLDivElement | null>(null);
  const resizableCursorRef = useRef<HTMLDivElement | null>(null);
  const [forceRender, setForceRender] = useState(false);
  const widthRef = useRef(0);
  const factorRef = useRef(factor);
  const tdWidthRef = useRef(0);

  useEffect(() => {
    const wd =
      document.querySelector('.table-item')?.getClientRects()[0]?.width ?? 0;
    widthRef.current = wd * factor;
    tdWidthRef.current = wd;
    setForceRender(!forceRender);

    function resize() {
      const wtd =
        document.querySelector('.table-item')?.getClientRects()[0]?.width ?? 0;
      tdWidthRef.current = wtd;
      widthRef.current = wtd * factorRef.current;
      setForceRender((f) => !f);
    }
    window.addEventListener('resize', resize);
    if (reservation.isLocked) return;
    const { current } = resizableRef;
    const { current: cursor } = resizableCursorRef;
    if (!current || !cursor) return;
    const onMouseMove = (e: MouseEvent) => {
      useEventsStore.getState().setIsResizing(true);
      const { clientX } = e;
      const { left } = current.getBoundingClientRect();
      const newWidth = clientX - left;
      if (newWidth < 0) return;
      widthRef.current = newWidth;
      current.style.width = `${newWidth}px`;
    };
    const onMouseUp = () => {
      document.body.style.cursor = 'default';
      let newWidth =
        Math.round(widthRef.current / tdWidthRef.current) * tdWidthRef.current;
      newWidth = newWidth == 0 ? tdWidthRef.current : newWidth;
      widthRef.current = newWidth;
      factorRef.current = newWidth / tdWidthRef.current;
      onResized?.(newWidth / tdWidthRef.current);
      useEventsStore.getState().setIsResizing(false);
      current.style.width = `${newWidth}px`;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      resizableRef.current?.classList.remove('transition');
    };
    cursor.addEventListener('mousedown', onMouseDown);
    return () => {
      cursor.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factor]);

  const [showModal, setShowModal] = useState(false);
  function handleModalClose() {
    setShowModal(false);
  }
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: reservation.id,
      data: reservation,
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <>
      <div
        className="dragable-resizable-item"
        id={`reservation-${reservation.id}`}
        ref={(e) => {
          resizableRef.current = e;
          if (reservation.isLocked) return;
          setNodeRef(e);
        }}
        onClick={(e) => {
          if (e.detail === 2) onDoubleClick?.();
        }}
        style={{
          width: `${widthRef.current}px`,
          ...(reservation.isLocked ? {} : verticalDrag(style)),
          backgroundColor: reservation.color ?? '#b95501',
        }}
      >
        {reservation.isLocked && <img src={lock} />}
        <span
          {...listeners}
          {...attributes}
          onClick={() => {
            setShowModal(!showModal);
          }}
        >
          {reservation.name}
        </span>
        {!reservation.isLocked && (
          <div className="resize-cursor" ref={resizableCursorRef}>
            <div />
          </div>
        )}
      </div>

      {modal && (
        <Overlay
          target={resizableRef.current}
          show={showModal && !isDragging}
          placement="bottom"
        >
          {({ placement, arrowProps, show: _show, popper, ref, ...props }) => (
            <ModalTip onClose={handleModalClose} props={props} ref={ref}>
              {modal(handleModalClose)}
            </ModalTip>
          )}
        </Overlay>
      )}
    </>
  );
}
