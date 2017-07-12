import React, { Component } from 'react'
import Data from '../../../DataRequests'
import Auth from '../../Auth'

import UserActions from '../../../actions/UserActions'

export default class UserFollow extends Component {
  constructor (props) {
    super(props)

    this.state = {
      change: false
    }
  }

  isAlreadyFollowed () {
    for (let id of Auth.getUser().follows) {
      if (this.props.userId.toString() === id.toString()) {
        return true
      }
    }

    return false
  }

  followUser (e) {
    e.preventDefault()

    let request = Data.post(`/api/user/follow/${this.props.userId}`, {}, true)

    $.ajax(request)
      .done((user) => {
        UserActions.followUserSuccess(user)
        this.setState(prevstate => ({change: !prevstate.change}))
      })
  }

  unfollowUser (e) {
    e.preventDefault()

    let request = Data.post(`/api/user/unfollow/${this.props.userId}`, {}, true)

    $.ajax(request)
      .done((user) => {
        UserActions.followUserSuccess(user)
        this.setState(prevstate => ({change: !prevstate.change}))
      })
  }

  render () {
    if (Auth.getUser()._id === this.props.userId) {
      return <div />
    }

    if (this.props.userId === '') {
      return <div />
    }

    let followBtn

    if (this.isAlreadyFollowed()) {
      followBtn = <a onClick={this.unfollowUser.bind(this)} className='btn btn-warning' >Unfollow User</a>
    } else {
      followBtn = <a onClick={this.followUser.bind(this)} className='btn btn-warning' >Follow User</a>
    }

    return (
      <div>
        {followBtn}
      </div>
    )
  }
}
