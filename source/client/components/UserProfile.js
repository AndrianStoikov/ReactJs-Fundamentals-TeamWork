import React from 'react'
import { Redirect } from 'react-router-dom'
import Auth from './Auth'

import UserActions from '../actions/UserActions'
import UserStore from '../stores/UserStore'

import UserInfo from './sub-components/user-profile/UserInfo'
import UserPosts from './sub-components/user-profile/UserPosts'

export default class UserProfile extends React.Component {
  constructor (props) {
    super(props)

    this.state = UserStore.getState()

    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    UserActions.getUserOwnPosts(this.props.match.params.userId)
    UserActions.getUserInformation(this.props.match.params.userId)
    UserStore.listen(this.onChange)
  }

  componentWillUnmount () {
    UserStore.unlisten(this.onChange)
    UserActions.clearProfileFields()
  }

  componentDidUpdate (nextProps) {
    if (nextProps.match.params.userId !== this.props.match.params.userId) {
      UserActions.getUserOwnPosts(this.props.match.params.userId)
      UserActions.getUserInformation(this.props.match.params.userId)
    }
  }

  render () {

    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    let nodes = {}
    nodes.roles = this.state.roles.map((role, index) => {
      return (
        <h4 key={index} className='lead' >
          <strong>{role}</strong>
        </h4>
      )
    })

    return (
      <div>
        <UserInfo
          profile={this.state.profile} />
        <UserPosts
          posts={this.state.userPosts}
          getUserPosts={UserActions.getUserOwnPosts.bind(this, this.props.match.params.userId)}
        />
      </div>
    )
  }
}
