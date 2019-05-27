import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';
import endpoints from '../context/endpoints';

class SignupPage extends Component {
  state = {
    email: '',
    password: '',
    name: '',
    remember: false,
    error: false,
    isLogin: true
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
    this.nameEl = React.createRef();
    this.surnameEl = React.createRef();
  }

  submitHandler = event => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;
    const name = this.nameEl.current.value;
    const surname = this.surnameEl.current.value;
    let userId = "";
    let authHead = "";

    if (email.trim().length === 0 || password.trim().length === 0 || name.trim().length === 0 || surname.trim().length === 0 ) {
      return;
    }

    let requestBody = {
      name: name,
      surname: surname,
      email: email,
      password: password
    };

    fetch(endpoints.signup, {
      mode: 'cors',
      method: 'post',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    })
    .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        authHead = res.headers.get('Authorization');
        return res.json();
    })

    .then(resData => {
      console.log(resData.userId);
      userId = resData.userId;
      this.context.login(
        authHead,
        userId,
        "24h"
      )
    })
    .catch(err => {
      console.log(err);
    });
  };

  render() {
    return (
        <form className="auth-form" onSubmit={this.submitHandler}>
          <div className="form-control">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" ref={this.nameEl} />
          </div>
          <div className="form-control">
            <label htmlFor="surname">Surname</label>
            <input type="text" id="surname" ref={this.surnameEl} />
          </div>
          <div className="form-control">
            <label htmlFor="email">E-Mail</label>
            <input type="email" id="email" ref={this.emailEl} />
          </div>
          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" ref={this.passwordEl} />
          </div>
          <button type="submit">Submit</button>
      </form>
    );
  }
}

export default SignupPage;