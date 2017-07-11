import React from 'react'
import Auth from '../Auth'

class Message extends React.Component {
  render () {
    // Was the message sent by the current user. If so, add a css class\
    let currUser = Auth.getUser()
    let authorId = this.props.authorId
    let fromMe = ''
    if (currUser._id === authorId) {
      fromMe = 'from-me'
    }

    return (
      <div className={`message ${fromMe}`}>
        <div className='username'>
          { this.props.username }
        </div>
        <div className='message-body'>
          { this.props.message }
        </div>
      </div>
    )
  }
}

Message.defaultProps = {
  message: '',
  username: '',
  fromMe: false
}

export default Message
