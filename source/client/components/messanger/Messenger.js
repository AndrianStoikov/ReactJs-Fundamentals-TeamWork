import React from 'react'
import MessageStore from '../../stores/messenger-stores/MessengerStore'
import UserActions from '../../actions/UserActions'
import Messages from './Messages'
import MessageInput from '../sub-components/Message-input'
import MessageThread from './MessageThread'
import { Link, Redirect } from 'react-router-dom'
import Auth from '../Auth'

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
    this.setState({ submitted: true, username: this.state.username })
  }

  render () {
    if (this.state.submitted) {
      // Form was submitted, now show the main App
      return (
        <Redirect to={`/thread/${this.state.username}`} />
        // <MessageThread username={this.state.username} />
      )
    }

    let threadsRender = this.state.userThreads.map(thread => {
      if (thread.users[0] === Auth.getUser().username) {
        thread.otherUser = thread.users[1]
      } else {
        thread.otherUser = thread.users[0]
      }
      return (
        <div>
          <Link className='list-group-item' key={thread._id} to={`/thread/${thread.otherUser}`}>{thread.otherUser}</Link>
        </div>
      )
    })

    return (
      <div className='container' >
        <h3 className='text-center' >Messenger
        </h3>
        <div className='col-sm-8'>
          <div className='list-group'>
            {threadsRender}
          </div>
          <form onSubmit={this.usernameSubmitHandler} className='username-container'>
            <div className='form-group'>
              <input
                type='text'
                onChange={this.usernameChangeHandler}
                placeholder='Enter a username...'
                required
                className='form-control' />
            </div>
            <input type='submit' value='Submit' className='btn btn-default' />
          </form>
        </div>
      </div>
    )
  }
}

export default Messenger
