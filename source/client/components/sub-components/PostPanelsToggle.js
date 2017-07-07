import React from 'react'
import { Link } from 'react-router-dom'

export default class PostPanelToggles extends React.Component {

  isLiked () {
    let likes = this.props.postLikes
    for (let like of likes) {
      if (this.props.userId === like.toString()) {
        return true
      }
    }

    return false
  }

  render () {
    let likeButton
    if (this.isLiked()) {
      likeButton = <a
        className='btn btn-primary'
        onClick={this.props.unlikePost} >
        Unlike
      </a>
    } else {
      likeButton = <a
        className='btn btn-primary'
        onClick={this.props.likePost} >
        Like
      </a>
    }
    return (
      <div className='pull-right btn-group' >
        <a
          className='btn btn-primary'
          onClick={this.props.toggleCommentsPanel} >
          {this.props.showCommentsPanel ? 'Hide' : 'Comments'}
        </a>
        {likeButton}
        <Link to={`/movie/${this.props.movieId}/review/add`} className='btn btn-warning' >
          Write review
        </Link>
      </div>
    )
  }
}
