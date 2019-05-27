import React, { Component } from 'react';

import './Auth.css';
import '../index.css';
import AuthContext from '../context/auth-context';
import LoginPage from './login';
import SignupPage from './signup';
import endpoints from '../context/endpoints';

class AuthPage extends Component {
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
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
    this.nameEl = React.createRef();
    this.surnameEl = React.createRef();
  }

  switchModeHandler = () => {
    console.log(this.state.isLogin);
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  };

  submitHandler = event => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;
    
    let userId = "";
    let authHead = "";
    
    
    if(this.state.isLogin){
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
    }

    else {
      const name = this.nameEl.current.value;
    const surname = this.surnameEl.current.value;
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
    }
  };

  render() {
    this.state.isLogin ? console.log(this.state.isLogin)  : console.log(this.state.isLogin)
    return (
      <div>
      { this.state.isLogin ? (
          <form className="auth-form" onSubmit={this.submitHandler}>
            <div className="form-control">
              <label htmlFor="email">E-Mail</label>
              <input type="email" id="email" ref={this.emailEl} />
            </div>
            <div className="form-control">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" ref={this.passwordEl} />
            </div>
            <div className="form-actions">
              <button type="submit">Submit</button>
              <button type="button" onClick={this.switchModeHandler}>
                Switch to Signup
              </button>
            </div>
          </form>
        )  : 
        (
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
            <div className="form-actions">
              <button type="submit">Submit</button>
              <button type="button" onClick={this.switchModeHandler}>
                  Switch to Login
              </button>
            </div>
          </form>
        )}
      </div>

    );
  }
}

export default AuthPage;
