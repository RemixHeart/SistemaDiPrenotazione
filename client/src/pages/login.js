import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';
import endpoints from '../context/endpoints';

class LoginPage extends Component {
  state = {
    email: '',
    password: ''
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }
  submitHandler = event => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;
    let userId = "";
    let authHead = "";

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      email: email,
      password: password
    };
    console.log(requestBody);
    fetch(endpoints.login, {
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

export default LoginPage;
