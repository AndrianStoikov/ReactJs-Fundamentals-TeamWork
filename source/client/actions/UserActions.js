import alt from '../alt'
import Data from '../DataRequests'

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
      'getProfileInfoSuccess',
      'logoutUserSuccess'
    )
  }

  getUserOwnPosts (userId) {
    let req = Data.get(`/api/post/own/${userId}`, true)

    $.ajax(req)
      .done(posts => this.getUserOwnPostsSuccess(posts))
      .fail(() => this.getUserOwnPostsFail())

    return true
  }

  getUserInformation (userId) {
    let request = Data.get(`/api/user/${userId}`, true)

    $.ajax(request)
      .done(userInfo => this.getProfileInfoSuccess(userInfo))

    return true
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
