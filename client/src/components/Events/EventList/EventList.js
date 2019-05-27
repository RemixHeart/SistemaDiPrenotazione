import React from 'react';

import EventItem from './EventItem/EventItem';
import './EventList.css';

const eventList = props => {
  const events = props.events.map(event => {
    return (
      <EventItem
        key={event.id}
        id={event.id}
        eventId={event.id}
        name={event.name}
        desc={event.desc}
        dateStart={event.dateStart}
        dateFinish={event.dateFinish}
        userId={props.authUserId}
        ownerId={event.owner}
        onDetail={props.onViewDetail}
      />
    );
  });

  return <ul className="event__list">{events}</ul>;
};

export default eventList;
