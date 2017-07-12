import React from 'react'
import Messages from './Messages'
import MessageInput from './Message-input'
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
      <div className="messenger-container">
        <h3>Chat with <b>{this.props.match.params.otherUserUsername}</b></h3>
        <Messages
          firstUserId={this.state.firstUserId}
          secondUserId={this.state.secondUserId}
          messages={this.state.messages} />
        <MessageInput onSend={this.sendHandler} />
      </div>
    )
  }
}

MessageThread.defaultProps = {
  username: 'Anonymous'
}

export default MessageThread
