import React from 'react'
import Comment from './comments/Comment'

export default class PostCommentsPanel extends React.Component {
  render () {
    let comments = this.props.comments.map(comment => <Comment key={comment._id} comment={comment} />)

    return (
      <div className='list-group' >
        <h3 className='col-sm-3' >Comments:</h3>
        { comments }
      </div>
    )
  }
}
