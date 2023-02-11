import { parse, subMinutes, isWithinInterval } from 'date-fns';
import { Room, HourMinute, TimeBlock } from '../types/types';

export function calculateTimeBlock(data: Room[], time: HourMinute): TimeBlock {
  let guestsCount = 0;
  let reservationCount = 0;
  let reservationGuests = 0;
  data.forEach(({ tables }) => {
    tables.forEach(({ reservations }) => {
      reservations.forEach(({ start, end, capacity }) => {
        const current = `${time.hour}:${time.minute}`;
        const currentDate = parse(current, 'HH:mm', new Date());
        const startDate = parse(start, 'HH:mm', new Date());
        const endDate = subMinutes(parse(end, 'HH:mm', new Date()), 1);
        if (start == current) {
          reservationGuests += capacity;
          reservationCount++;
        }

        if (isWithinInterval(currentDate, { start: startDate, end: endDate }))
          guestsCount += capacity;
      });
    });
  });
  return {
    guestsCount,
    reservationCount,
    reservationGuests,
    time: `${time.hour}:${time.minute}`,
  };
}
