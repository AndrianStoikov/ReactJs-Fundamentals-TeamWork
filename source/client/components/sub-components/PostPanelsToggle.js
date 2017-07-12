import React from 'react'
import {Link} from 'react-router-dom'

import Auth from '../Auth'

export default class PostPanelToggles extends React.Component {

  isLiked () {
    let currentUserId = Auth.getUser()._id
    let likes = this.props.postLikes
    for (let like of likes) {
      if (currentUserId === like.toString()) {
        return true
      }
    }

    return false
  }

  render () {
    let likeButton
    if (this.isLiked()) {
      likeButton = <a
        className='btn btn-default'
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

    let editMovie
    let deleteMovie
    if (this.props.post.author._id === Auth.getUser()._id || Auth.isUserAdmin()) {
      editMovie =
        <Link
          to={`/post/edit/${this.props.post._id}`}
          className='btn btn-warning'>
          Edit Post
        </Link>
      deleteMovie =
        <Link
          to={`/post/delete/${this.props.post._id}`}
          className='btn btn-danger'>
          Delete Post
        </Link>
    }
    return (
      <div className='pull-right btn-group post-control-panel' >
        <Link to={`/post/comment/${this.props.postId}`} className='btn btn-primary'>Comment post</Link>
        {editMovie}
        {deleteMovie}
        <a
          className='btn btn-primary'
          onClick={this.props.toggleCommentsPanel} >
          {this.props.showCommentsPanel ? 'Hide' : 'Comments'}
        </a>
        {likeButton}
      </div>
    )
  }
}
