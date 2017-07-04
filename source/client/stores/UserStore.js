import UserActions from '../actions/UserActions'
import alt from '../alt'

class UserStore {
  constructor () {
    this.bindActions(UserActions)

    this.loggedInUserId = ''
    this.username = ''
    this.roles = []
    this.userIsLoggedIn = false
  }

  onLoginUserSuccess (user) {
    this.loggedInUserId = user._id
    this.username = user.username
    this.roles = user.roles
    this.userIsLoggedIn = true
  }

  onLoginUserFail () {
    console.log('Failed loggin attempt')
  }

  onLogoutUserSuccess () {
    this.loggedInUserId = ''
    this.userIsLoggedIn = false
  }
}

export default alt.createStore(UserStore)
