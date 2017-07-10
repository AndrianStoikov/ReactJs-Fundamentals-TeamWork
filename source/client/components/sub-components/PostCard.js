import React from 'react'

import PostInfo from './PostInfo'
import PostPanelsToggle from './PostPanelsToggle'

export default class PostCard extends React.Component {
  render () {
    return (
      <div className='animated fadeIn' >
        <div className='media movie' >
          <span className='position pull-left' >{ this.props.index + 1 }</span>
          <PostInfo post={this.props.post} />
          <PostPanelsToggle
            likePost={this.props.likePost}
            unlikePost={this.props.unlikePost}
            postLikes={this.props.post.likes}
            postId={this.props.post._id} />
        </div>
        <div id='clear' />
      </div>
    )
  }
}
