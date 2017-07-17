import React, { Component } from 'react'
import Auth from '../../../utilities/Auth'
import { Redirect } from 'react-router-dom'
import Form from '../../form/Form'
import TextGroup from '../../form/TextGroup'
import Submit from '../../form/Submit'

import PostCommentActions from '../../../actions/post-actions/PostCommentActions'
import PostCommentStore from '../../../stores/post-stores/PostCommentStore'

export default class EditComment extends Component {
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

    let content = this.state.editContent
    if (content === '') {
      PostCommentActions.editCommentValidationFail()
      return
    }

    PostCommentActions.editComment(this.props.match.params.id, {'content': content})
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
        title='Edit Comment'
        handleSubmit={this.handleSubmit.bind(this)}
        submitState={this.state.editCommentFormSubmitState}
        message={this.state.editCommentMessage} >

        <TextGroup
          type='text'
          value={this.state.editContent}
          label='Your Comment'
          handleChange={PostCommentActions.handleEditCommentChange}
          validationState={this.state.editCommentContentValidationState} />

        <Submit
          type='btn-primary'
          value='Edit Comment' />

      </Form>
    )
  }
}
