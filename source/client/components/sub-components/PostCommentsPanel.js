import React from 'react'
import CommentForm from './CommentsForm'

export default class PostCommentsPanel extends React.Component {
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
      <div className='list-group' >
        <h3 className='col-sm-3' >Comments:</h3>
        { comments }
        <div className='col-sm-6 col-xs-offset-6 list-group-item animated fadeIn' >
          <div className='media' >
            <CommentForm movieId={this.props.post} />
          </div>
        </div>
      </div>
    )
  }
}
