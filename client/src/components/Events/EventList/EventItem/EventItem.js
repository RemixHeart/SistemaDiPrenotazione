import React from 'react';

import './EventItem.css';

const eventItem = props => (
  <li key={props.eventId} className={props.userId === props.ownerId ? "events__list-item2" : "events__list-item"}>
    <div id={props.id} >
      <h1>{props.name}</h1>
      <h2>
        {new Date(props.dateStart).toLocaleDateString()} - {new Date(props.dateFinish).toLocaleDateString()}
      </h2>
    </div>
    <div>
      {/* {props.userId === props.ownerId ? ( 
        <p>Your the owner of this event.</p>
      ) : (
        <button className="btn" onClick={props.onDetail.bind(this, props.id)}>
          View Details
        </button>
      )}*/}
      <button className="btn" onClick={props.onDetail.bind(this, props.id)}>
          View Details
        </button>
    </div>
  </li>
);


export default eventItem;
