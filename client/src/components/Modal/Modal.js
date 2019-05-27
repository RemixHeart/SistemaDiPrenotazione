import React from 'react';

import './Modal.css';

const modal = props => (
  
  <div className={props.deleteText === 'true' ? "modal sec2" : "modal"}>
    <header className={props.deleteText === 'true' ? "modal__header2" : "modal__header"}>
      <h1></h1>
    </header>
    <section className="modal__content">{props.children}</section>
    <section className="modal__actions">
      {props.canCancel && (
        <button className="btn" onClick={props.onCancel}>
          Cancel
        </button>
      )}

      { props.deleteText === 'true' ? (
        <button className="btn" onClick={props.onDelete}>
          Delete
        </button>
      )
      :( props.confirmText !== 'Confirm' && (
        <button className="btn" onClick={props.onConfirm}>
          {props.confirmText}
        </button> )
      )
      }
    </section>
  </div>
);

export default modal;
