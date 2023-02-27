/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import './style/index.scss';
import { Overlay } from 'react-bootstrap';
import { useDraggable } from '@dnd-kit/core';
import { useEventsStore } from '../../../../store/eventsStore';
import ModalTip from '../modal_tip';
import { HourMinute, Reservation } from '../../../../types/types';
import { addMinutes, parse, format } from 'date-fns';
import lock from '../../../../assets/icons/lock.svg';

interface DragableResizableItemProps {
  factor: number;
  tableId: number;
  diffResult: number;
  diffEndResult: number;
  rangeList: HourMinute[];
  onResized?: (from: 'start' | 'end', time: string) => void;
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
        // transform: `translateY(${style.transform.split(',')[1]}`,
      }
    : style;

export default function DragableResizableItem({
  factor,
  tableId,
  diffEndResult,
  diffResult,
  onResized,
  reservation,
  modal,
  rangeList,
  onDoubleClick,
}: DragableResizableItemProps) {
  const resizableRef = useRef<HTMLDivElement | null>(null);
  const resizableCursorRef = useRef<HTMLDivElement | null>(null);
  const resizableCursorRefLeft = useRef<HTMLDivElement | null>(null);
  const [forceRender, setForceRender] = useState(false);
  const resizeFrom = useRef<'right' | 'left' | null>(null);
  const startX = useRef<null | number>(null);
  const startWidth = useRef<null | number>(null);
  const widthRef = useRef(0);
  const leftRef = useRef(0);
  const factorRef = useRef(factor);
  const tdWidthRef = useRef(0);
  const marginLeftRef = useRef(0);
  const [marginLeft] = useState(() => {
    if (diffResult === 5) {
      return '33.3333333';
    } else if (diffResult === 10) {
      return '66.6666666';
    }
    return 0;
  });

  useEffect(() => {
    const wd =
      document.querySelector('.table-item')?.getClientRects()[0]?.width ?? 0;
    let newMarginLeft = (diffResult * wd) / 15;
    let newAddedWidth = (diffEndResult * wd) / 15;
    widthRef.current = wd * factor - newMarginLeft + newAddedWidth;
    tdWidthRef.current = wd;
    marginLeftRef.current = newMarginLeft;
    let timeout = setTimeout(() => {
      setForceRender((f) => !f);
    }, 0);

    function resize() {
      const wtd =
        document.querySelector('.table-item')?.getClientRects()[0]?.width ?? 0;
      tdWidthRef.current = wtd;
      newMarginLeft = (diffResult * wtd) / 15;
      newAddedWidth = (diffEndResult * wtd) / 15;
      widthRef.current =
        wtd * factorRef.current - newMarginLeft + newAddedWidth;
      marginLeftRef.current = newMarginLeft;
      setForceRender((f) => !f);
    }
    window.addEventListener('resize', resize);
    if (reservation.lock_tables) return;
    const { current } = resizableRef;
    const { current: cursor } = resizableCursorRef;
    const { current: leftCursor } = resizableCursorRefLeft;
    if (!current || !cursor || !leftCursor) return;
    const onMouseMove = (e: MouseEvent) => {
      useEventsStore.getState().setIsResizing(true);
      if (resizeFrom.current === 'right') {
        const { clientX } = e;
        const { left } = current.getBoundingClientRect();
        const newWidth = clientX - left;
        if (newWidth < 0) return;
        widthRef.current = newWidth;
        current.style.width = `${newWidth}px`;
      } else if (resizeFrom.current === 'left') {
        const { clientX } = e;
        const x = (clientX - startX.current!) as number;
        // if (newWidth < 0) return;
        leftRef.current = x;
        const newWidth = startWidth.current! - x;
        widthRef.current = newWidth;
        current.style.left = `${x}px`;
        current.style.width = `${newWidth}px`;
      }
    };
    const onMouseUp = () => {
      document.body.style.cursor = 'default';
      if (resizeFrom.current === 'left') {
        const wtd =
          document.querySelector('.table-item')?.getClientRects()[0]?.width ??
          0;
        const fac = Math.floor(Math.abs(leftRef.current) / wtd);
        const directionNumber = leftRef.current < 0 ? -1 : 1;

        const index = rangeList.findIndex((range) => {
          const { hour, minute } = range;
          const [h, m] = reservation.time.split(':');

          const diff = +m - +minute;
          if (h === hour && diff <= 14 && diff >= 0) {
            return true;
          }
          return false;
        });
        // if (index !== -1)
        startX.current = null;
        startWidth.current = null;
        leftRef.current = 0;
        const timeIndex = fac * directionNumber + index;
        let hour;
        let minute;
        if (rangeList?.[timeIndex]) {
          const rangeItem = rangeList?.[timeIndex];
          hour = rangeItem.hour;
          minute = rangeItem.minute;
          const timeStart = format(
            addMinutes(
              parse(`${hour}:${minute}`, 'HH:mm', new Date()),
              diffResult,
            ),
            'HH:mm',
          );
          onResized?.('start', timeStart);
        } else {
          // console.log(reservation.time);
          // // const timeStart = format(
          // //   addMinutes(
          // //     parse(reservation.time, 'HH:mm', new Date()),
          // //     diffResult,
          // //   ),
          // //   'HH:mm',
          // // );
          onResized?.('start', reservation.time);
        }
      } else {
        let newWidth =
          Math.round(widthRef.current / tdWidthRef.current) *
          tdWidthRef.current;
        newWidth = newWidth == 0 ? tdWidthRef.current : newWidth;
        newMarginLeft = (diffResult * tdWidthRef.current) / 15;
        newAddedWidth = (diffEndResult * tdWidthRef.current) / 15;
        widthRef.current = newWidth - newMarginLeft + newAddedWidth;
        factorRef.current =
          (newWidth - newMarginLeft + newAddedWidth) / tdWidthRef.current;
        marginLeftRef.current = newMarginLeft;

        current.style.width = `${newWidth}px`;

        const end = format(
          addMinutes(
            parse(reservation.time, 'HH:mm', new Date()),
            (newWidth / tdWidthRef.current) * 15,
          ),
          'HH:mm',
        );
        const index = rangeList.findIndex((range) => {
          const { hour, minute } = range;
          const [h, m] = end.split(':');

          const diff = +m - +minute;
          if (h === hour && diff <= 14 && diff >= 0) {
            return true;
          }
          return false;
        });

        if (rangeList.length === index || index === -1) {
          onResized?.('end', reservation.end);
        } else {
          onResized?.(
            'end',
            format(
              addMinutes(
                parse(reservation.time, 'HH:mm', new Date()),
                (newWidth / tdWidthRef.current) * 15,
              ),
              'HH:mm',
            ),
          );
        }
      }
      useEventsStore.getState().setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      resizeFrom.current = null;
    };
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      resizeFrom.current = 'right';
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      resizableRef.current?.classList.remove('transition');
    };

    const onMouseDownLeft = (e: MouseEvent) => {
      e.preventDefault();
      resizeFrom.current = 'left';
      startX.current = e.clientX;
      startWidth.current = resizableRef.current?.getBoundingClientRect()
        ?.width as number;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      resizableRef.current?.classList.remove('transition');
    };
    cursor.addEventListener('mousedown', onMouseDown);
    leftCursor.addEventListener('mousedown', onMouseDownLeft);
    return () => {
      cursor.removeEventListener('mousedown', onMouseDown);
      leftCursor.removeEventListener('mousedown', onMouseDownLeft);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', resize);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factor, diffEndResult, diffResult, reservation, rangeList]);

  const [showModal, setShowModal] = useState(false);
  function handleModalClose() {
    setShowModal(false);
  }
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${tableId}-${reservation.id}`,
      data: {
        reservation,
        diffResult,
      },
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  useEffect(() => {
    factorRef.current = factor;
  }, [factor, rangeList]);

  return (
    <>
      <div
        className="dragable-resizable-item"
        id={`reservation-${reservation.id}`}
        ref={(e) => {
          resizableRef.current = e;
          if (reservation.lock_tables) return;
          setNodeRef(e);
        }}
        onClick={(e) => {
          if (e.detail === 2) onDoubleClick?.();
        }}
        style={{
          width: `${widthRef.current}px`,
          marginLeft: `${marginLeftRef.current}px`,
          ...(reservation.lock_tables ? {} : verticalDrag(style)),
          backgroundColor: '#b95501',
        }}
      >
        {reservation.lock_tables && <img src={lock} />}
        <span
          style={!reservation.name ? { height: '100%' } : undefined}
          onClick={() => {
            setShowModal(!showModal);
          }}
          {...listeners}
          {...attributes}
        >
          {reservation.name}
        </span>
        {!reservation.lock_tables && (
          <>
            <div className="resize-cursor" ref={resizableCursorRef}>
              <div />
            </div>
            <div className="resize-cursor l" ref={resizableCursorRefLeft}>
              <div />
            </div>
          </>
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
