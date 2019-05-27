import React from 'react';

import './BookingList.css';

const bookingList = props => (
  <ul className="bookings__list">
    {props.bookings.map(booking => {
      return (
        <li key={booking.id} className="bookings__item">
          <div className="bookings__item-data">
            {booking.name} -{' '}
            {new Date(booking.dateStart).toLocaleDateString()} - {new Date(booking.dateFinish).toLocaleDateString()}
          </div>
          <div className="bookings__item-actions">
            <button className="btn" onClick={props.onDelete.bind(this, booking.id)}>Cancel</button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default bookingList;
