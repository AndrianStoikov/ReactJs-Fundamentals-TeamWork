import alt from '../alt'
import Auth from '../components/Auth'
import UserActions from '../actions/UserActions'

class UserStore {
  constructor () {
    this.bindActions(UserActions)

    this.loggedInUserId = ''
    this.username = ''
    this.roles = []
    this.userPosts = []
    this.profile = {
      userUsername: '',
      userAge: '',
      userFirstName: '',
      userLastName: '',
      userGender: ''
    }
  }

  onRegisterUserSuccess (responseData) {
    const user = responseData.user
    this.loggedInUserId = user._id
    this.username = user.username
    this.roles = user.roles
    Auth.authenticateUser(responseData.token)
    Auth.saveUser(user)
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
    this.userPosts = []
    Auth.deauthenticateUser()
    Auth.removeUser()
  }

  onGetUserOwnPostsSuccess (posts) {
    this.userPosts = posts
  }

  onGetUserOwnPostsFail () {
    console.log('Couldn\'t get user own posts. Problem with the DB')
  }

  onGetProfileInfoSuccess (user) {
    this.profile.userUsername = user.username
    this.profile.userAge = user.age
    this.profile.userFirstName = user.firstName
    this.profile.userLastName = user.lastName
    this.profile.gender = user.gender
  }
}

export default alt.createStore(UserStore)
