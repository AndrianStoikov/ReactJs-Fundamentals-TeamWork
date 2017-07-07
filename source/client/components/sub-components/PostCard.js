import React from 'react'

import UserStore from '../../stores/UserStore'

import PostInfo from './PostInfo'
import PostPanelsToggle from './PostPanelsToggle'
import PostVotePanel from './PostVotePanel'
import PostCommentsPanel from './PostCommentsPanel'

export default class PostCard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showCommentsPanel: false
    }
  }

  likePost () {
    let postId = this.props.post._id
    let request = {
      url: `/api/post/like/${postId}`,
      method: 'post'
    }

    $.ajax(request)
      .done(() => this.props.getUserPosts())
  }

  unlikePost () {
    let postId = this.props.post._id
    let request = {
      url: `/api/post/unlike/${postId}`,
      method: 'post'
    }

    $.ajax(request)
      .done(() => this.props.getUserPosts())
  }

  toggleCommentsPanel () {
    this.setState(prevState => ({
      showCommentsPanel: !prevState.showCommentsPanel,
      showVotePanel: false
    }))
  }

  render () {
    return (
      <div className='animated fadeIn' >
        <div className='media movie' >
          <span className='position pull-left' >{ this.props.index + 1 }</span>
          <PostInfo post={this.props.post} />
          <PostPanelsToggle
            userId={UserStore.getState().loggedInUserId}
            toggleCommentsPanel={this.toggleCommentsPanel.bind(this)}
            showCommentsPanel={this.state.showCommentsPanel}
            likePost={this.likePost.bind(this)}
            unlikePost={this.unlikePost.bind(this)}
            postLikes={this.props.post.likes}
            movieId={this.props.post._id} />
        </div>
        {this.state.showVotePanel ? <PostVotePanel movieId={this.props.post._id} /> : null}
        {this.state.showCommentsPanel
          ? <PostCommentsPanel comments={this.props.post.comments} postId={this.props.post._id} /> : null}
        <div id='clear' />
      </div>
    )
  }
}
