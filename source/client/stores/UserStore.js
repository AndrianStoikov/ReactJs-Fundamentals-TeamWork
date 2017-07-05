import alt from '../alt'

import HomeActions from '../actions/HomeActions'
import UserActions from '../actions/UserActions'

class UserStore {
  constructor () {
    this.bindActions(UserActions)

    this.loggedInUserId = ''
    this.username = ''
    this.roles = []
  }

  onRegisterUserSuccess (user) {
    this.loggedInUserId = user._id
    this.username = user.username
    this.roles = user.roles
  }

  onLoginUserSuccess (user) {
    this.loggedInUserId = user._id
    this.username = user.username
    this.roles = user.roles
  }

  onLoginUserFail () {
    console.log('Failed loggin attempt')
  }

  onLogoutUserSuccess () {
    this.loggedInUserId = ''
    this.username = ''
    this.roles = []
  }
}

export default alt.createStore(UserStore)
