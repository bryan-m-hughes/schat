/*
The MIT License (MIT)

Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { Link, dispatch } from 'flvx';
import { actions } from 'actions';
import { api } from 'util';

let socket = Symbol();

export class LoginLink extends Link {
  constructor(io) {
    this[socket] = io;
  }
  dispatch(action) {
    switch(action.type) {
      case actions.LOGIN_SUBMITTED:
        api({
          method: 'post',
          endpoint: 'auth',
          content: {
            username: action.username,
            password: action.password
          }
        }, (status, response) => {
          switch(status) {
            case 200:
              dispatch({
                type: actions.LOGIN_SUCCEEDED,
                token: response
              });
              break;
            case 401:
              dispatch({
                type: actions.LOGIN_FAILED,
                error: 'Invalid username or password'
              });
              break;
            default:
              dispatch({
                type: actions.LOGIN_FAILED,
                err: 'Internal server error'
              });
              break;
          }
        });
        break;
    }
  }
}