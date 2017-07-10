import React from 'react'

import UserPostsPanel from './UserPostsPanel'

export default class UserPosts extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showPostsPanel: false
    }
  }

  togglePosts () {
    this.setState(prevState => ({
      showPostsPanel: !prevState.showPostsPanel
    }))
  }

  render () {
    return (
      <div className='container profile-container' >
        <div className='profile-stats clearfix' >
          <ul>
            <li>
              <span className='stats-number' >{this.props.posts ? this.props.posts.length : 0 }</span>Posts
            </li>
          </ul>
        </div>
        <div className='pull-right btn-group' >
          <a className='btn btn-primary' onClick={this.togglePosts.bind(this)} >
            {this.state.showPostsPanel ? 'Hide' : 'Show User Posts' }
          </a>
        </div>
        <div className='user-posts' >
          {this.state.showPostsPanel
            ? <UserPostsPanel posts={this.props.posts} getUserPost={this.props.getUserPosts} /> : null}
        </div>
      </div>
    )
  }
}