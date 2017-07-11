import alt from '../../alt'
import Auth from '../../components/Auth'
import MessageActions from '../../actions/MessageActions'
import UserActions from '../../actions/UserActions'

class MessageThreadStore {
  constructor () {
    this.bindActions(MessageActions)
    this.messages = []
    this.threadId = ''
  }

  onSendMessageSuccess (thread) {
    this.messages = thread.messages
    this.threadId = thread._id
  }
  onGetThreadMessagesSuccess (thread) {
    this.messages = thread.messages
    this.threadId = thread._id
  }

  onGetThreadMessagesFail () {
    console.log('Failed loading messages')
  }
}

export default alt.createStore(MessageThreadStore)
