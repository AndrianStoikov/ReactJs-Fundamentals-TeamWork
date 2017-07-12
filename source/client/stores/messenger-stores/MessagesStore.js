import alt from '../../alt'
import Auth from '../../components/Auth'
import MessageActions from '../../actions/MessageActions'
import UserActions from '../../actions/UserActions'

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
