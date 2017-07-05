import React from 'react'

import PostInfo from './PostInfo'
import PostPanelsToggle from './PostPanelsToggle'
import PostVotePanel from './PostVotePanel'
import PostCommentsPanel from './PostCommentsPanel'

export default class PostCard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showVotePanel: false,
      showCommentsPanel: false
    }
  }

  toggleCommentsPanel () {
    this.setState(prevState => ({
      showCommentsPanel: !prevState.showCommentsPanel,
      showVotePanel: false
    }))
  }

  toggleVotePanel () {
    this.setState(prevState => ({
      showVotePanel: !prevState.showVotePanel,
      showCommentsPanel: false
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
            toggleVotePanel={this.toggleVotePanel.bind(this)}
            showCommentsPanel={this.state.showCommentsPanel}
            showVotePanel={this.state.showVotePanel}
            movieId={this.props.post._id} />
        </div>
        {this.state.showVotePanel ? <PostVotePanel movieId={this.props.post._id} /> : null}
        {this.state.showCommentsPanel
          ? <PostCommentsPanel comments={this.props.movie.comments} movieId={this.props.post._id} /> : null}
        <div id='clear' />
      </div>
    )
  }
}
