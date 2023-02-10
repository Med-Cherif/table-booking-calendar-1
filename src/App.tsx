import './App.scss';
import TablesBookingTimeline from './components/tables_booking_timeline';
import { useDataStore } from './store/dataStore';

function App() {
  const { data, onChanges } = useDataStore();
  return (
    <div className="app-container">
      <TablesBookingTimeline
        data={data}
        lockedTime={['11:15']}
        timeRange={{ endHour: 21, startHour: 10, step: 15 }}
        reservationTooltip={(reservation) => (
          <div>
            <ul>
              <li>
                ({reservation.name}),{reservation.capacity} pers.
              </li>
              <li>
                {reservation.start} - {reservation.end}
              </li>
            </ul>
          </div>
        )}
        cellTooltip={(time) => <div>{time}</div>}
        onReservationChange={(change) => {
          console.log(change);
          onChanges(change);
        }}
        onEmptyCellClick={(time) => {
          console.log(time);
        }}
        reservationModal={(reservation, close) => {
          return (
            <div>
              <p>{reservation.name}</p>
              <button onClick={close}>Close</button>
            </div>
          );
        }}
        capacityModal={(time, close) => {
          return (
            <div>
              <p>{time}</p>
              <button onClick={close}>Close</button>
            </div>
          );
        }}
      />
    </div>
  );
}

export default App;
