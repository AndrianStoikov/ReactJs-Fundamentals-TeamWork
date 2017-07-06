import alt from '../alt'
import Auth from '../components/Auth'
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
    this.loggedInUserId = ''
    this.username = ''
    this.roles = []
  }

  onLoginUserSuccess (responseData) {
    const user = responseData.user
    this.loggedInUserId = user._id
    this.username = user.username
    this.roles = user.roles
    Auth.authenticateUser(responseData.token)
    Auth.saveUser(user)
  }

  onLoginUserFail () {
    console.log('Failed loggin attempt')
  }

  onLogoutUserSuccess () {
    this.loggedInUserId = ''
    this.username = ''
    this.roles = []
    Auth.deauthenticateUser()
    Auth.removeUser()
  }
}

export default alt.createStore(UserStore)
