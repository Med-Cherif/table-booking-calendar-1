/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import './style/index.scss';
import { Overlay, Tooltip } from 'react-bootstrap';
import { useDraggable } from '@dnd-kit/core';
import { useEventsStore } from '../../../../store/eventsStore';
import ModalTip from '../modal_tip';
interface DragableResizableItemProps {
  factor: number;
  onResized?: (factor: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  modal?: (close: () => void) => React.ReactNode;
  tooltip?: React.ReactNode;
  reservation: {
    id: number;
    start: string;
    end: string;
    capacity: number;
    name: string;
  };
}

const verticalDrag = (style: React.CSSProperties | undefined) =>
  style?.transform
    ? {
        ...style,
        transform: `translate(0px, ${style.transform.split(',')[1]}`,
      }
    : style;

export default function DragableResizableItem({
  factor,
  onResized,
  reservation,
  modal,
  tooltip,
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

  const [showTip, setShowTip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  function handleModalClose() {
    setShowTip(false);
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
        ref={(e) => {
          setNodeRef(e);
          resizableRef.current = e;
        }}
        style={{ width: `${widthRef.current}px`, ...verticalDrag(style) }}
        onMouseOver={() => setShowTip(true)}
        onMouseOut={() => setShowTip(false)}
      >
        <span
          {...listeners}
          {...attributes}
          onClick={() => {
            setShowModal(!showModal);
            setShowTip(false);
          }}
        >
          {reservation.name}
        </span>
        <div className="resize-cursor" ref={resizableCursorRef}>
          <div />
        </div>
      </div>
      {tooltip && (
        <Overlay
          target={resizableRef.current}
          show={showTip && !isDragging}
          placement="bottom"
        >
          <Tooltip>{tooltip}</Tooltip>
        </Overlay>
      )}
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
