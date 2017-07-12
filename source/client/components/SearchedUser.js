import React from 'react'
import { Redirect, Link } from 'react-router-dom'
import SearchedUserStore from '../stores/SearchedUserStore'
import SearchedUserActions from '../actions/SearchedUserActions'

import Auth from './Auth'

export default class SearchedUser extends React.Component {
  constructor (props) {
    super(props)
    this.state = SearchedUserStore.getState()

    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    SearchedUserStore.listen(this.onChange)
    SearchedUserActions.getUsers(this.props.match.params.username)
  }

  componentWillUnmount () {
    SearchedUserStore.unlisten(this.onChange)
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    let users = this.state.users.map((user) => {
      return (
        <div key={user._id} >
          <Link to={`/user/profile/${user._id}`} className='btn btn-warning' >Goto profile</Link>
          Username: {user.username}
        </div>
      )
    })

    return (
      <div className='container' >
        <h3 className='text-center' >
          {users}
        </h3>
      </div>
    )
  }
}
