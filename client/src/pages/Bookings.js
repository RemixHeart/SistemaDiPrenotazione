import React, { Component } from 'react';

import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import BookingList from '../components/Bookings/BookingList/BookingList';
import BookingsControls from '../components/Bookings/BookingsControls/BookingsControls';
import endpoints from '../context/endpoints';

class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: [],
    bookingList: [],
    outputType: 'list'
  };

  static contextType = AuthContext;

 

  componentDidMount() {
    console.log(this.context);
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ bookings: [], bookingList: [], isLoading: true });

    fetch(`${endpoints.getEventsByUserId.replace(':id', this.context.userId)}?mode=joined`,{
      mode: 'cors',
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        console.log(res);
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        //let bookings = this.state.bookings;
        let bookings = new Array();
        resData.forEach(el => {
          bookings.push(el);
        });
        //bookings.push(resData);
        this.setState({ bookings: bookings, isLoading: false });
        console.log(this.state);
        this.fetchAllBookings();
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  fetchAllBookings = () => {

    this.state.bookings.forEach( el => {

      let bookingList = new Array();

      fetch(endpoints.getEventById.replace(':id', el),{
        mode: 'cors',
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.context.token
        }
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        bookingList = this.state.bookingList;
        bookingList.push(resData);
        this.setState({ bookingList: bookingList});
        console.log(this.state.bookingList);
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
    });

  };

  cancelBooking = bookingId => {
    this.setState({ isLoading: true });
    fetch(endpoints.cancelEventById
      .replace(':eventId', bookingId)
      .replace(
          ':userId',
          this.context.userId
      ),
      {
        mode: 'cors',
        method: 'delete',
        headers: {
            Authorization: this.context.token,
        },
      }
    ).then((res) => {
      if (res.ok){
        console.log(`La tua prenotazione Ã¨ stata cancellata`);
        this.fetchBookings();
      }
      else
        throw new Error('Failed!');
    });
  }

  changeOutputTypeHandler = outputType => {
    if (outputType === 'list') {
      this.setState({ outputType: 'list' });
    } else {
      this.setState({ outputType: 'chart' });
    }
  };

  render() {
    let content = <Spinner />;
    if (!this.state.isLoading) {
      content = (
        <React.Fragment>
          <BookingsControls
            activeOutputType={this.state.outputType}
            onChange={this.changeOutputTypeHandler}
          />
          <div>
            {this.state.outputType === 'list' ? (
              <BookingList
                bookings={this.state.bookingList}
                onDelete={this.cancelBooking}
              />
            ) : (
              <BookingList
                bookings={this.state.bookingList}
                onDelete={this.cancelBooking}
              />
            )}
          </div>
        </React.Fragment>
      );
    }
    return <React.Fragment>{content}</React.Fragment>;
  }
}

export default BookingsPage;
