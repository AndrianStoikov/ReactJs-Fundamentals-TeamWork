import React from 'react'

import {Link} from 'react-router-dom'

export default class UserInfo extends React.Component {
  render () {
    return (
      <div className='container profile-container'>
        <div className='profile-img'>
          <img src='/images/user-default.png' />
        </div>
        <div className='profile-info clearfix'>
          <h2><strong>First Name: { this.props.profile.userFirstName }</strong></h2>
          <h2><strong>Last Name: { this.props.profile.userLastName }</strong></h2>
          <h2><strong>Gender: { this.props.profile.gender }</strong></h2>
          <h2><strong>Username: { this.props.profile.userUsername }</strong></h2>
          <h2><strong>Age: { this.props.profile.userAge }</strong></h2>
          <h4 className='lead'><Link className='label' to='/user/block'>Block user</Link></h4>
        </div>
      </div>
    )
  }
}
