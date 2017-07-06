import alt from '../alt'

import HomeActions from './HomeActions'

class UserActions {
  constructor () {
    this.generateActions(
      'registerUserSuccess',
      'registerUserFail',
      'loginUserSuccess',
      'loginUserFail',
      'logoutUserSuccess',
      'getUserOwnPostsSuccess',
      'getUserOwnPostsFail',
      'getProfileInfoSuccess'
    )
  }

  registerUser (data) {
    let request = {
      url: '/user/register',
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json'
    }

    $.ajax(request)
      .done((data) => {
        this.registerUserSuccess(data)
      })
      .fail(err => {
        console.log('Error', err)
        this.registerUserFail(err.responseJSON.message)
      })

    return true
  }

  loginUser (data) {
    let request = {
      url: '/user/login',
      method: 'post',
      data: JSON.stringify(data),
      contentType: 'application/json'
    }

    $.ajax(request)
      .done(data => {
        this.loginUserSuccess(data)
      })
      .fail(err => this.loginUserFail(err.responseJSON))

    return true
  }

  logoutUser () {
    let request = {
      url: '/user/logout',
      method: 'post'
    }

    $.ajax(request)
      .done(() => {
        this.logoutUserSuccess()
        HomeActions.removePostsSuccess()
      })

    return true
  }
}

export default alt.createActions(UserActions)
