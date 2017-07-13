import alt from '../../alt'
import Data from '../../utilities/DataRequests'
import toastr from 'toastr'

import HomeActions from '../common-actions/HomeActions'

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
      'getMultipleUserInfoSuccess',
      'logoutUserSuccess',
      'followUserSuccess',
      'getUserThreadsSuccess',
      'getUserThreadsFail',
      'clearProfileFields'
    )
  }

  getUserThreads (userId) {
    let request = Data.get(`/api/threads`, true)

    $.ajax(request)
      .done(threads => this.getUserThreadsSuccess(threads))
      .fail(() => this.getUserThreadsFail())

    return true
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

  getMultipleUserInformation (firstUserId, secondUserId) {
    let request = Data.get(`/api/user/${firstUserId}/${secondUserId}`, true)

    $.ajax(request)
      .done(usersData => {
        this.getMultipleUserInfoSuccess(usersData)
      })

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
        if (err.responseJSON.message.message) {
          toastr.error(err.responseJSON.message.message)
        } else {
          toastr.error(err.responseJSON.message.errmsg)
        }
        this.registerUserFail(err.responseJSON.message.message)
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
      .fail(err => {
        toastr.error(JSON.parse(err.responseText).message)
        this.loginUserFail(err.responseJSON)
      })

    return true
  }

  logoutUser (history) {
    let request = {
      url: '/user/logout',
      method: 'post'
    }

    $.ajax(request)
      .done(() => {
        toastr.success('Logged Out')
        this.logoutUserSuccess()
        HomeActions.removePostsSuccess()
        history.push('/user/login')
      })

    return true
  }
}

export default alt.createActions(UserActions)
