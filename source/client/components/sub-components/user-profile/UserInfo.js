import React from 'react'

export default class UserInfo extends React.Component {
  render () {
    return (
      <div className='container profile-container'>
        <div className='profile-img'>
          <img src='/images/user-default.png'/>
        </div>
        <div className='profile-info clearfix'>
          <h2><strong>{ this.props.name }</strong></h2>
          <p>{ this.props.information }</p>
        </div>
      </div>
    )
  }
}