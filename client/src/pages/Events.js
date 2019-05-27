import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import './Events.css';
import endpoints from '../context/endpoints';

let imageD = null;
class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    place: {
      lat: "45.51667",
      lon: "9.86667"
    },
    image: null,
    isLoading: false,
    selectedEvent: null
  };
  isActive = true;

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.postsElRef = React.createRef();
    this.dateStartElRef = React.createRef();
    this.dateFinishElRef = React.createRef();
    this.descriptionElRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  handleImage = (evt) => {
    /*const files = Array.from(e.target.files)
    const formData = new FormData()

    files.forEach((file, i) => {
      formData.append(i, file)
    })*/
    const file = evt.target.files[0];
    imageD = file;
    console.log(file);
    this.setState({ image: file });
    console.log(this.state.image);
    console.log(imageD);
  };

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const posts = this.postsElRef.current.value;
    const dateStart = this.dateStartElRef.current.value;
    const dateFinish = this.dateFinishElRef.current.value;
    const description = this.descriptionElRef.current.value;
    console.log(imageD);
    const requestBody = {
      name: title,
      description: description,
      place: "45.51667,9.86667",
      dateStart: dateStart,
      dateFinish: dateFinish,
      maxSeats: posts,
      image: imageD
    };

    let formData = new FormData();

    Object.keys(requestBody).forEach((key) => {
      formData.append(key, requestBody[key]);
    });
    //formData.append("image", imageD);

    console.log(formData);

    fetch(endpoints.getEvents, {
      mode: 'cors',
      method: 'post',
      body: formData,
      headers: {
        Authorization: this.context.token,
      },
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
      })
      .catch(err => {
        console.log(err);
      });

      this.fetchEvents();
      
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  fetchEvents() {
    this.setState({ events: [], isLoading: true });
    fetch(endpoints.getEvents, {
      mode: 'cors',
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        //const events = resData.data.events;
        const events = resData;
        if (this.isActive) {
          this.setState({ events: events, isLoading: false });
        }
      })
      .catch(err => {
        console.log(err);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  }

  showDetailHandler = eventId => {
    this.setState(prevState => {
      let selectedEvent = prevState.events.find(e => e.id === eventId);
      console.log(selectedEvent);
      return { selectedEvent: selectedEvent };
    });
  };

  deleteEvent = eventId => {
    fetch(endpoints.deleteEventById.replace(':id', this.state.selectedEvent.id),
    {
      mode: 'cors',
      method: 'delete',
      headers: {
        Authorization: this.context.token,
      },
    }
        ).then((res) => {
            if (res.ok){
              alert("Event Deleted");
              this.modalCancelHandler();
              this.fetchEvents();
            }
            else {
              alert("failed");
              throw new Error('Failed!');
            }
              
        });
  };

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }
    console.log(this.state.selectedEvent)
    fetch(endpoints.joinEventById
                .replace(':eventId', this.state.selectedEvent.id)
                .replace(
                    ':userId',
                    this.context.userId
                ),
            {
                mode: 'cors',
                method: 'post',
                headers: {
                    Authorization: this.context.token,
                },
            }
    ).then((res) => {
      if (res.ok){
        alert("Yay! you just booked this event");
        this.modalCancelHandler();
        this.fetchEvents();
      }
      else {
        if (res.status === 400)
          return this.setState({
              error: true,
              message: `I posti sono esauriti`,
              variant: 'error',
          });
        else if (res.status === 403)
          return this.setState({
              error: true,
              message: `Sei giÃ  iscritto all'evento`,
              variant: 'error',
          });
        else
          return this.setState({
              redirectToLogin: true,
          });
      }
    });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Create"
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Data Start</label>
                <input type="datetime-local" id="date" ref={this.dateStartElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Data Finish</label>
                <input type="datetime-local" id="date" ref={this.dateFinishElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Avalaible Posts</label>
                <input type="number" min="1" max="3" id="posts" ref={this.postsElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="image">Image</label>
                <input type="file" id="image"
                  onChange={this.handleImage}
                    accept=".jpg" 
                
                />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="4"
                  ref={this.descriptionElRef}
                />
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.name}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
            onDelete={this.deleteEvent}
            deleteText={this.state.selectedEvent.owner === this.context.userId ? 'true' : 'false'}
            confirmText={this.context.token ? 'Book' : 'Confirm'}
          >
            <h1>{this.state.selectedEvent.name}</h1>
            <h2>
              {new Date(this.state.selectedEvent.dateStart).toLocaleDateString()} -{' '}
              {new Date(this.state.selectedEvent.dateStart).toLocaleDateString()}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
            <p>Available seats: {this.state.selectedEvent.maxSeats}</p>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Create A New Event!</p>
            <button className="btn" onClick={this.startCreateEventHandler}>
              Create Event
            </button>
          </div>
        )}
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        )}
      </React.Fragment>
    );
  }
}

export default EventsPage;
