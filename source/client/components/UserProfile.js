import React from 'react'

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
    UserStore.listen(this.onChange)
    UserActions.getUserOwnPosts(this.state.loggedInUserId)
    UserActions.getUserInformation(this.props.match.params.userId)
  }

  componentWillUnmount () {
    UserStore.unlisten(this.onChange)
  }

  render () {
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
          name={this.state.name}
          roles={this.state.roles}
          profile={this.state.profile} />
        <UserPosts posts={this.state.userPosts} />
      </div>
    )
  }
}
