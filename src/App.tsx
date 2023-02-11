import './App.scss';
import TableBookingCalendar from './components/table_booking_calendar';
import { useDataStore } from './store/dataStore';

function App() {
  const { data, onChanges } = useDataStore();
  return (
    <div className="app-container">
      <TableBookingCalendar
        data={data}
        lockedTime={['11:15']}
        timeRange={{ endHour: 24, startHour: 8, step: 15 }}
        reservationTooltip={(reservation) => (
          <div style={{ fontSize: 'x-small' }}>
            ({reservation.name}),{reservation.capacity} pers. <br />
            {reservation.start} - {reservation.end}
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
          console.log(change);
          onChanges(change);
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
              ({reservation.name}),{reservation.capacity} pers. <br />
              {reservation.start} - {reservation.end}
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
