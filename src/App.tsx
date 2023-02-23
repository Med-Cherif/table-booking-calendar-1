import { useEffect, useState } from 'react';
import './App.scss';
import TableBookingCalendar from './components/table_booking_calendar';
import { useDataStore } from './store/dataStore';
import { format, differenceInMinutes, parse, addMinutes } from 'date-fns';

export const getIntervalTimes = ({
  startTime = '00:00',
  endTime = '23:59',
  interval = 15,
}) => {
  const start = startTime.split(':');
  const end = endTime.split(':');

  const startMinutes = +start[0] * 60 + +start[1];
  const endMinutes = +end[0] * 60 + +end[1];

  const difference = endMinutes - startMinutes;

  const length = Math.ceil(difference / interval);

  const times: string[] = [];

  for (let i = 0; i < length + 1; i++) {
    const time = Math.min(startMinutes + i * interval, endMinutes);

    let hours: string | number = Math.floor(time / 60);
    let minutes: string | number = time % 60;

    hours = hours > 9 ? hours : `0${hours}`;
    minutes = minutes > 9 ? minutes : `0${minutes}`;

    times.push(`${hours}:${minutes}`);
  }

  return times;
};

function App() {
  const { data, onChanges, setData } = useDataStore();

  useEffect(() => {
    const getData = async () => {
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      // setData([
      // ]);
    };
    getData();
  }, []);

  // console.log(data);

  return (
    <div className="app-container">
      <TableBookingCalendar
        data={data}
        lockedTime={['11:15']}
        times={getIntervalTimes({
          startTime: '08:00',
          endTime: '12:15',
        }).concat(
          getIntervalTimes({
            startTime: '13:00',
            endTime: '21:00',
          }),
        )}
        timeRange={{ endHour: 24, startHour: 8, step: 15 }}
        reservationTooltip={(reservation) => (
          <div style={{ fontSize: 'x-small' }}>
            ({reservation.name}),{reservation.persons} pers. <br />
            {reservation.time} - {reservation.end}
          </div>
        )}
        cellTooltip={(timeBlock) => (
          <div style={{ fontSize: 'x-small' }}>
            {timeBlock.time}
            <br />
            guest: {timeBlock.reservationGuests}
            <br />
            booking: {timeBlock.reservationCount}
            <br />
            guest(total): {timeBlock.guestsCount}
          </div>
        )}
        onReservationChange={(change) => {
          // console.log(change);
          const startTIme = parse(change.reservation.time, 'HH:mm', new Date());
          const endTIme = parse(change.reservation.end, 'HH:mm', new Date());
          const duration = differenceInMinutes(endTIme, startTIme);
          console.log();
          const newEndTime = format(
            addMinutes(
              parse(change.newTimeStart, 'HH:mm', new Date()),
              duration,
            ),
            'HH:mm',
          );
          onChanges({ ...change, end: newEndTime });
        }}
        onEmptyCellClick={(time) => {
          console.log(time);
        }}
        onReservationClick={(reservation) => {
          console.log(reservation);
        }}
        reservationModal={(reservation, close) => {
          return (
            <div
              style={{
                fontSize: 'small',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                gap: 10,
              }}
            >
              ({reservation.name}),{reservation.persons} pers. <br />
              {reservation.time} - {reservation.end}
              <button onClick={close}>Close</button>
            </div>
          );
        }}
        capacityModal={(timeBlock, close) => {
          return (
            <div
              style={{
                fontSize: 'small',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                gap: 10,
              }}
            >
              {timeBlock.time}
              <br />
              guest: {timeBlock.reservationGuests}
              <br />
              booking: {timeBlock.reservationCount}
              <br />
              guest(total): {timeBlock.guestsCount}
              <button onClick={close}>Close</button>
            </div>
          );
        }}
      />
    </div>
  );
}

export default App;
/*
- Locked reservations 
- Double click reservation
- Room text style and info
- color
- grid style
*/
