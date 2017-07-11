import React from 'react'

import Message from './MessageSingle'

class Messages extends React.Component {

  componentDidUpdate () {
    // There is a new message in the state, scroll to bottom of list
    const objDiv = document.getElementById('messageList')
    objDiv.scrollTop = objDiv.scrollHeight
  }

  render () {
    // Loop through all the messages in the state and create a Message component
    const messages = this.props.messages.map((message) => {
      return (
        <Message
          key={message._id}
          username={message.authorUsername}
          message={message.content}
          authorId={message.author}
          />
      )
    })

    return (
      <div className='messages' id='messageList'>
        { messages }
      </div>
    )
  }
}

Messages.defaultProps = {
  messages: []
}

export default Messages
