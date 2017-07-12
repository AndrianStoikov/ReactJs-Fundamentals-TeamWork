import React from 'react'
import UserActions from '../../actions/UserActions'
import MessagesStore from '../../stores/messenger-stores/MessagesStore'
import Message from '../../components/messanger/MessageSingle'

class Messages extends React.Component {
  constructor (props) {
    super(props)
    // set the initial state of messages so that it is not undefined on load
    this.state = MessagesStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    MessagesStore.listen(this.onChange)
  }

  componentWillReceiveProps (nextProps) {
    UserActions.getMultipleUserInformation(nextProps.firstUserId, nextProps.secondUserId)
  }

  componentWillUnmount () {
    MessagesStore.unlisten(this.onChange)
  }

  componentDidUpdate () {
    // There is a new message in the state, scroll to bottom of list
    const objDiv = document.getElementById('messageList')
    objDiv.scrollTop = objDiv.scrollHeight
  }

  attachUserPicture (authorId) {
    if (authorId === this.state.firstUserInfo._id) {
      return this.state.firstUserInfo.profilePicture
    } else {
      return this.state.secondUserInfo.profilePicture
    }
  }

  render () {
    // Loop through all the messages in the state and create a Message component
    const messages = this.props.messages.map((message) => {
      let userPicture = this.attachUserPicture(message.author)
      if (!userPicture) {
        userPicture = 'http://images.htcampus.com/htcmedia/images/default-profile.jpg'
      }
      return (
        <Message
          key={message._id}
          username={message.authorUsername}
          message={message.content}
          authorId={message.author}
          userPic={userPicture}
          />
      )
    })

    return (
      <div className='messenger-messages' id='messageList'>
        { messages }
      </div>
    )
  }
}

Messages.defaultProps = {
  messages: []
}

export default Messages
