import React, { Component } from 'react'
import Auth from '../../../utilities/Auth'
import { Redirect } from 'react-router-dom'
import Form from '../../form/Form'
import Submit from '../../form/Submit'

import PostCommentActions from '../../../actions/post-actions/PostCommentActions'
import PostCommentStore from '../../../stores/post-stores/PostCommentStore'

export default class DeleteComment extends Component {
  constructor (props) {
    super(props)

    this.state = PostCommentStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentWillMount () {
    PostCommentStore.listen(this.onChange)
    if (Auth.getUser()._id) {
      let commentId = this.props.match.params.id
      PostCommentActions.getCommentInfo(commentId)
    }
  }

  componentWillUnmount () {
    PostCommentStore.unlisten(this.onChange)
    PostCommentActions.clearRedirectSuccess()
  }

  handleSubmit (e) {
    e.preventDefault()
    PostCommentActions.deleteComment(this.props.match.params.id)
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    if (this.state.redirect) {
      return <Redirect to='/' />
    }

    return (
      <Form
        title='Delete Comment'
        handleSubmit={this.handleSubmit.bind(this)}
        message={this.state.deleteCommentMessage} >

        <div className='form-group ' >
          <label className='control-label' >Your Comment</label>
          <input
            type='text' className='form-control'
            value={this.state.editContent}
            disabled />
          <span className='help-block' >{this.state.deleteCommentMessage}</span>
        </div>

        <Submit
          type='btn-primary'
          value='Delete Comment' />

      </Form>
    )
  }
}
