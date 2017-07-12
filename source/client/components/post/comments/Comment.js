import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Auth from '../../Auth'

export default class Comment extends Component {
  render () {
    let editButton
    let deleteButton

    if (Auth.isUserAuthenticated() && Auth.getUser()._id.toString() === this.props.comment.author.toString()) {
      editButton = <Link
        to={`/comment/edit/${this.props.comment._id}`}
        className='btn btn-warning'>
        Edit Comment
      </Link>
      deleteButton = <Link
        to={`/comment/delete/${this.props.comment._id}`}
        className='btn btn-danger'>
        Delete Comment
      </Link>
    } else if (Auth.isUserAdmin()) {
      editButton = <Link
        to={`/comment/edit/${this.props.comment._id}`}
        className='btn btn-warning'>
        Edit Comment
      </Link>
      deleteButton = <Link
        to={`/comment/delete/${this.props.comment._id}`}
        className='btn btn-danger'>
        Delete Comment
      </Link>
    }

    return (
      <div key={this.props.comment._id} className='comment col-sm-8 list-group-item animated fadeIn' >
        <div className='media' >
          <div className='media-body' >
            <p>{this.props.comment.content}</p>
          </div>
          {editButton}
          {deleteButton}
        </div>
      </div>
    )
  }
}
