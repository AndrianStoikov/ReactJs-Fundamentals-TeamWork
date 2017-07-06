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
      url: `/api/post/own/${this.state.loggedInUserId}`,
      method: 'get'
    }

    $.ajax(request)
      .done(posts => UserActions.getUserOwnPostsSuccess(posts))
      .fail(() => UserActions.getUserOwnPostsFail())
  }

  componentDidMount () {
    UserStore.listen(this.onChange)
    this.getUserOwnPosts()
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
          information={this.state.information} />
        <UserPosts posts={this.state.userPosts} />
      </div>
    )
  }
}
