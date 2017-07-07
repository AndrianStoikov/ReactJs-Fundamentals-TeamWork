import alt from '../alt'
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
    this.userPosts = []
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
