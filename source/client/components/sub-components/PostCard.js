import React from 'react'

import PostInfo from './PostInfo'
import PostPanelsToggle from './PostPanelsToggle'
import PostCommentsPanel from './PostCommentsPanel'

export default class PostCard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showCommentsPanel: false
    }
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
            toggleCommentsPanel={this.toggleCommentsPanel.bind(this)}
            showCommentsPanel={this.state.showCommentsPanel}
            likePost={this.props.likePost}
            unlikePost={this.props.unlikePost}
            postLikes={this.props.post.likes}
            movieId={this.props.post._id}
            post={this.props.post} />
        </div>
        {this.state.showCommentsPanel
          ? <PostCommentsPanel comments={this.props.post.comments} postId={this.props.post._id} /> : null}
        <div id='clear' />
      </div>
    )
  }
}
