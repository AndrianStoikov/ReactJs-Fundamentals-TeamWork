import alt from '../../alt'
import Auth from '../../components/Auth'
import MessageActions from '../../actions/MessageActions'
import UserActions from '../../actions/UserActions'

class MessageStore {
  constructor () {
    this.bindActions(MessageActions)
    this.bindListeners({
      onGetUserThreadsSuccess: UserActions.getUserThreadsSuccess,
      onGetUserThreadsFail: UserActions.getUserThreadsFail
    })

    this.userThreads = []
  }

  onGetUserThreadsSuccess (threads) {
    this.userThreads = threads
  }

  onGetUserThreadsFail () {
    console.log('Failed loading user\'s threads')
  }
}

export default alt.createStore(MessageStore)
