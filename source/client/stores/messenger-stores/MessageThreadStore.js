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
    console.log('Failed loading messages')
  }
}

export default alt.createStore(MessageThreadStore)
