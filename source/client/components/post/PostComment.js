import React, { Component } from 'react'

import CommentForm from '../sub-components/CommentsForm'
import PostInfo from '../sub-components/PostInfo'

export default class PostComment extends Component {
  render () {
    let comments = this.props.comments.map(comment => {
      return (
        <div key={comment._id} className='comment col-sm-9 list-group-item animated fadeIn' >
          <div className='media' >
            <div className='media-body' >
              <p>{comment.content}</p>
            </div>
          </div>
        </div>
      )
    })

    return (
      <div>
        <PostInfo post={this.props.post} />
        <div className='list-group' >
          <h3 className='col-sm-3' >Comments:</h3>
          { comments }
          <div className='col-sm-6 col-xs-offset-6 list-group-item animated fadeIn' >
            <div className='media' >
              <CommentForm movieId={this.props.post} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}