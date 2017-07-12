import alt from '../../alt'
import Auth from '../../components/Auth'
import MessageActions from '../../actions/MessageActions'
import UserActions from '../../actions/UserActions'

class MessageThreadStore {
  constructor () {
    this.bindActions(MessageActions)
    this.messages = []
    this.threadId = ''
    this.firstUserId = ''
    this.secondUserId = ''
  }

  onSendMessageSuccess (thread) {
    this.messages = thread.messages
    this.threadId = thread._id
    this.firstUserId = thread.userIds[0]
    this.secondUserId = thread.userIds[1]
  }
  onGetThreadMessagesSuccess (thread) {
    this.messages = thread.messages
    this.threadId = thread._id
    this.firstUserId = thread.userIds[0]
    this.secondUserId = thread.userIds[1]
  }

  onGetThreadMessagesFail () {
    console.log('Could not load thread messages. User does not exists or you are trying to open a thread with yourself')
  }
}

export default alt.createStore(MessageThreadStore)
