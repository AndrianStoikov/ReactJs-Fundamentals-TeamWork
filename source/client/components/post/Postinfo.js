import React from 'react'
import { Link } from 'react-router-dom'

export default class PostInfo extends React.Component {
  render () {
    return (
      <div className='media-body' >
        <h4 className='media-heading' >
          <i>Posted by: </i><Link to={`/user/profile/${this.props.post.author._id}`} >
            {this.props.post.author.username}
          </Link>
        </h4>
        <br />
        <p>{ this.props.post.content }</p>
        <span className='votes' >Likes:
                    <strong> { this.props.post.likes.length }</strong>
        </span>
      </div>
    )
  }
}
