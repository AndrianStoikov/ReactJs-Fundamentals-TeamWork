import React from 'react'
import MessageStore from '../../stores/messenger-stores/MessengerStore'
import UserActions from '../../actions/UserActions'
import Messages from './Messages'
import MessageInput from './Message-input'
import MessageThread from './MessageThread'
import MessageActions from '../../actions/MessageActions'
import { Link, Redirect } from 'react-router-dom'
import Auth from '../Auth'
import toastr from 'toastr'

class Messenger extends React.Component {
  constructor (props) {
    super(props)
    this.state = MessageStore.getState()

    this.onChange = this.onChange.bind(this)
    this.usernameChangeHandler = this.usernameChangeHandler.bind(this)
    this.usernameSubmitHandler = this.usernameSubmitHandler.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    MessageStore.listen(this.onChange)
    if (Auth.isUserAuthenticated()) {
      UserActions.getUserThreads()
    }
  }

  componentWillUnmount () {
    MessageStore.unlisten(this.onChange)
  }

  usernameChangeHandler (event) {
    this.setState({ username: event.target.value })
  }

  usernameSubmitHandler (event) {
    event.preventDefault()
    MessageActions.getThreadMessages(this.state.username)
    this.setState({ submitted: true, username: this.state.username })
  }

  render () {
    if (this.state.submitted) {
      // Form was submitted, now show the main App
      if (this.state.validThread) {
        return (
          <Redirect to={`/thread/${this.state.username}`} />
        )
      }
    }

    let threadsRender = this.state.userThreads.map(thread => {
      if (thread.users[0] === Auth.getUser().username) {
        thread.otherUser = thread.users[1]
      } else {
        thread.otherUser = thread.users[0]
      }
      return (
        <div key={thread._id}>
          <Link className='list-group-item' to={`/thread/${thread.otherUser}`}>{thread.otherUser}</Link>
        </div>
      )
    })

    return (
      <div className='container' >
        <h3 className='text-center' >Your chats
        </h3>
        <div className='col-sm-6 col-sm-offset-3'>
          <div className='list-group'>
            {threadsRender}
          </div>
        </div>
        <form onSubmit={this.usernameSubmitHandler} className='messenger username-container'>
          <h1>Messenger</h1>
          <div>
            <input
              type='text'
              onChange={this.usernameChangeHandler}
              placeholder='Enter a username...'
              required />
          </div>
          <input type='submit' value='Chat now' />
        </form>
      </div>
    )
  }
}

export default Messenger
