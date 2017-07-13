import alt from '../../alt'
import Auth from '../../utilities/Auth'
import MessageActions from '../../actions/messenger-actions/MessageActions'
import UserActions from '../../actions/user-actions/UserActions'

class MessagesStore {
  constructor () {
    this.bindListeners({
      onGetMultipleUserInfoSuccess: UserActions.getMultipleUserInfoSuccess
    })
    this.firstUserInfo = {}
    this.secondUserInfo = {}
  }

  onGetMultipleUserInfoSuccess (usersData) {
    this.firstUserInfo = usersData.firstUser
    this.secondUserInfo = usersData.secondUser
  }
}

export default alt.createStore(MessagesStore)
