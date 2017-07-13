import alt from '../../alt'
import Auth from '../../utilities/Auth'
import UserActions from '../../actions/user-actions/UserActions'

class UserStore {
  constructor () {
    this.bindActions(UserActions)

    this._id = ''
    this.username = ''
    this.roles = []
    this.userPosts = []
    this.profile = {
      _id: '',
      userUsername: '',
      userAge: '',
      userFirstName: '',
      userLastName: '',
      userGender: '',
      userProfilePicture: ''
    }
  }

  onRegisterUserSuccess (responseData) {
    const user = responseData.user
    this.username = user.username
    this.roles = user.roles
    Auth.authenticateUser(responseData.token)
    Auth.saveUser(user)
  }

  onLoginUserSuccess (responseData) {
    const user = responseData.user
    this.username = user.username
    this.roles = user.roles
    Auth.authenticateUser(responseData.token)
    Auth.saveUser(user)
  }

  onLoginUserFail () {
    console.log('Failed loggin attempt')
  }

  onLogoutUserSuccess () {
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
    this.profile._id = user._id
    this.profile.userUsername = user.username
    this.profile.userAge = user.age
    this.profile.userFirstName = user.firstName
    this.profile.userLastName = user.lastName
    this.profile.userGender = user.gender
    this.profile.userProfilePicture = user.profilePicture
  }

  onFollowUserSuccess (user) {
    Auth.saveUser(user)
  }

  onClearProfileFields () {
    this.profile = {
      _id: '',
      userUsername: '',
      userAge: '',
      userFirstName: '',
      userLastName: '',
      userGender: '',
      userProfilePicture: ''
    }
  }
}

export default alt.createStore(UserStore)
