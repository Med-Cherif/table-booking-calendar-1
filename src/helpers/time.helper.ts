import { HourMinute } from '../types/types';

export function rangeToTime(times: string[]) {
  const res: HourMinute[] = [];
  times.forEach((time) => {
    const [hour, minute] = time.split(':');
    res.push({
      hour,
      minute,
    });
  });
  // for (let i = 0; i < endTime - startTime; i++) {
  //   for (let j = 0; j < 60; j += step) {
  //     const hour = i + startTime;
  //     res.push({
  //       hour: `${hour > 9 ? hour : '0' + hour}`,
  //       minute: `${j > 9 ? j : '0' + j}`,
  //     });
  //   }
  // }
  return res;
}
