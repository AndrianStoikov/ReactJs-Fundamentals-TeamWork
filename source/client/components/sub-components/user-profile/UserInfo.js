import React from 'react'
import FollowUser from './UserFollow'

export default class UserInfo extends React.Component {

  render () {
    let profileImg = (this.props.profile.userProfilePicture ? this.props.profile.userProfilePicture : 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png')
    return (
      <div className='container profile-container'>
        <div className='profile-img'>
          <img src={profileImg} />
        </div>
        <div className='profile-info clearfix'>
          <h2><strong>First Name: { this.props.profile.userFirstName }</strong></h2>
          <h2><strong>Last Name: { this.props.profile.userLastName }</strong></h2>
          <h2><strong>Gender: { this.props.profile.userGender }</strong></h2>
          <h2><strong>Username: { this.props.profile.userUsername }</strong></h2>
          <h2><strong>Age: { this.props.profile.userAge }</strong></h2>
          <FollowUser userId={this.props.profile._id} />
        </div>
      </div>
    )
  }
}
