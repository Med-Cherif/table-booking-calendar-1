export function rangeToTime(startTime: number, endTime: number, step: number) {
  const res: { hour: string; minute: string }[] = [];
  for (let i = 0; i < endTime - startTime; i++) {
    for (let j = 0; j < 60; j += step) {
      const hour = i + startTime;
      res.push({
        hour: `${hour > 9 ? hour : '0' + hour}`,
        minute: `${j > 9 ? j : '0' + j}`,
      });
    }
  }
  return res;
}
