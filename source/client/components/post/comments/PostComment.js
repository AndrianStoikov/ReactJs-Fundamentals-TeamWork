import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Auth from '../../Auth'

import CommentForm from '../../sub-components/CommentsForm'
import PostDetails from '../../sub-components/PostDetails'
import Comment from './Comment'

import PostCommentStore from '../../../stores/post-stores/PostCommentStore'
import PostCommentActions from '../../../actions/post-actions/PostCommentActions'

export default class PostComment extends Component {
  constructor (props) {
    super(props)

    this.state = PostCommentStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  handleSubmit (e) {
    e.preventDefault()

    if (!this.state.comment) {
      PostCommentActions.commentValidationFail()
      return
    }
    PostCommentActions.addComment(this.props.postId, this.state.comment)
  }

  componentDidMount () {
    PostCommentStore.listen(this.onChange)
    PostCommentActions.getPostInfo(this.props.match.params.postId)
  }

  componentWillUnmount () {
    PostCommentStore.unlisten(this.onChange)
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    let comments = this.state.comments.map(comment => <Comment key={comment._id} comment={comment} />)

    return (
      <div>
        <PostDetails post={this.state.post} />
        <div className='list-group' >
          <div className='col-xs-12'>
            <h3 className='col-sm-3' >Comments:</h3>
          </div>
          { comments }
          <div className='col-sm-8 list-group-item animated fadeIn' >
            <div className='media' >
              <CommentForm postId={this.state.post} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
