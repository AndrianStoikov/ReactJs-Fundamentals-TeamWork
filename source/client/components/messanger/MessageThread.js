import React from 'react'
import Messages from './Messages'
import MessageInput from '../sub-components/Message-input'
import MessageThreadStore from '../../stores/messenger-stores/MessageThreadStore'
import MessageActions from '../../actions/MessageActions'

class MessageThread extends React.Component {
  constructor (props) {
    super(props)
    // set the initial state of messages so that it is not undefined on load
    this.state = MessageThreadStore.getState()
    this.onChange = this.onChange.bind(this)
    this.sendHandler = this.sendHandler.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    MessageThreadStore.listen(this.onChange)
    if (this.props.username === 'Anonymous') {
      MessageActions.getThreadMessages(this.props.match.params.otherUserUsername)
    } else {
      MessageActions.getThreadMessages(this.props.username)
    }
  }

  addMessage (message) {
    const threadId = this.state.threadId
    MessageActions.sendMessage(message, threadId)
  }


  componentWillUnmount () {
    MessageThreadStore.unlisten(this.onChange)
  }

  sendHandler (content) {
    let messageObject = { content }
    this.addMessage(messageObject)
  }

  render () {
    return (
      <div className="container">
        <h3>Messenger</h3>
        <h5>Chat with {this.props.match.params.otherUserUsername}</h5>
        <Messages messages={this.state.messages} />
        <MessageInput onSend={this.sendHandler} />
      </div>
    )
  }
}

MessageThread.defaultProps = {
  username: 'Anonymous'
}

export default MessageThread
