import React from 'react'
import { Link } from 'react-router-dom'
import Auth from '../../components/Auth'

import UserActions from '../../actions/UserActions'
import UserStore from '../../stores/UserStore'

export default class NavbarUserMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = UserStore.getState()

    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    UserStore.listen(this.onChange)
  }

  componentWillUnmount () {
    UserStore.unlisten(this.onChange)
  }

  render () {
    return (
      <div>
        { Auth.isUserAuthenticated() ? (
          <ul className='nav navbar-nav pull-right' >
            <li>
              <div className='navbar-text'>
                Hello, {Auth.getUser().username}
              </div>
            </li>
            <li>
              <Link to={`/user/profile/${Auth.getUser()._id}`} >Profile</Link>
            </li>
            <li>
              <a href='#' onClick={UserActions.logoutUser} >Logout</a>
            </li>
          </ul>
        ) : (
          <ul className='nav navbar-nav pull-right' >
            <li>
              <Link to='/user/login' >Login</Link>
            </li>
            <li>
              <Link to='/user/register' >Register</Link>
            </li>
          </ul>
        )}
      </div>
    )
  }
}
