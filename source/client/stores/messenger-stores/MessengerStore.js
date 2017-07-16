import alt from '../../alt'
import Auth from '../../utilities/Auth'
import MessageActions from '../../actions/messenger-actions/MessageActions'
import UserActions from '../../actions/user-actions/UserActions'

class MessageStore {
  constructor () {
    this.bindActions(MessageActions)
    this.bindListeners({
      onGetUserThreadsSuccess: UserActions.getUserThreadsSuccess,
      onGetUserThreadsFail: UserActions.getUserThreadsFail
    })
    this.validThread = false
    this.userThreads = []
  }

  onGetUserThreadsSuccess (threads) {
    this.userThreads = threads
    this.validThread = false
  }

  onGetUserThreadsFail () {
    console.log('Failed loading user\'s threads')
  }

  onGetThreadMessagesFail () {
    this.validThread = false
  }

  onGetThreadMessagesSuccess (thread) {
    this.validThread = true
  }
}

export default alt.createStore(MessageStore)
