import { parse, differenceInMinutes, format } from 'date-fns';
import { useRef, useEffect, useState } from 'react';
import { TimeRange } from '../../../../types/types';
import './style/index.scss';
import { Tooltip } from 'react-tooltip';
interface TimeIndicatorProps {
  timeRange: TimeRange;
}
export default function TimeIndicator({ timeRange }: TimeIndicatorProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [_, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 60000);
    if (!divRef.current) return;
    const resize = () => {
      if (!divRef.current) return;
      const wtd =
        document.querySelector('.table-item')?.getClientRects()[0]?.width ?? 0;
      const startTime = parse(
        timeRange.startHour.toString() + ':00',
        'HH:mm',
        new Date(),
      );
      const def = differenceInMinutes(new Date(), startTime);
      const left = (def / timeRange.step) * wtd + 100;
      divRef.current.style.left = left + 'px';
    };
    const wtd =
      document.querySelector('.table-item')?.getClientRects()[0]?.width ?? 0;
    const startTime = parse(
      timeRange.startHour.toString() + ':00',
      'HH:mm',
      new Date(),
    );
    const def = differenceInMinutes(new Date(), startTime);
    const left = (def / timeRange.step) * wtd + 100;
    divRef.current.style.left = left + 'px';
    window.addEventListener('resize', resize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, [timeRange]);
  return (
    <div className="time-indicator" ref={divRef}>
      <i className="arrow" id="time-indicator"></i>
      <Tooltip
        anchorId="time-indicator"
        content={format(new Date(), 'HH:mm')}
      />
      <div className="line"></div>
    </div>
  );
}
