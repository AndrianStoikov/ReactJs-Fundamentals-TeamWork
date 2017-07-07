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

  getUserOwnPosts () {
    let request = {
      url: `/api/post/own/${this.props.match.params.userId}`,
      method: 'get'
    }

    $.ajax(request)
      .done(posts => UserActions.getUserOwnPostsSuccess(posts))
      .fail(() => UserActions.getUserOwnPostsFail())
  }

  getUserInformation () {
    let userId = this.props.match.params.userId
    let request = {
      url: `/api/user/${userId}`,
      method: 'get'
    }

    $.ajax(request)
      .done(userInfo => UserActions.getProfileInfoSuccess(userInfo))
  }

  componentDidMount () {
    UserStore.listen(this.onChange)
    this.getUserOwnPosts()
    this.getUserInformation()
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
        <UserPosts
          posts={this.state.userPosts}
          getUserPosts={this.getUserOwnPosts.bind(this)}
        />
      </div>
    )
  }
}
