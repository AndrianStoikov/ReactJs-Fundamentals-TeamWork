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

  componentDidUpdate (nextProps) {
    if (nextProps.match.params.username !== this.props.match.params.username) {
      SearchedUserActions.getUsers(this.props.match.params.username)
    }
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    let users = this.state.users.map((user) => {
      return (
        <li key={user._id} >
          <Link className='list-group-item' to={`/user/profile/${user._id}`} >{user.username}</Link>
        </li>
      )
    })

    return (
      <div className='container' >
        <h3 className='text-center ' >Results:</h3>
        <div className='panel-body' >
          <div className='col-sm-6 col-sm-offset-3 ' >
            <ul className='list-group list-unstyled'>
              {users}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}
