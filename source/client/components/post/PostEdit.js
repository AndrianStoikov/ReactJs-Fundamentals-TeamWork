import React, { Component } from 'react'
import Auth from '../../components/Auth'
import { Redirect } from 'react-router-dom'
import UserStore from '../../stores/UserStore'
import PostEditStore from '../../stores/PostEditStore'
import PostEditActions from '../../actions/PostEditActions'
import Form from '../form/Form'
import TextGroup from '../form/TextGroup'
import Submit from '../form/Submit'

export default class PostEdit extends Component {
  constructor (props) {
    super(props)
    this.state = PostEditStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    PostEditStore.listen(this.onChange)
    if (Auth.getUser()._id) {
      let postId = this.props.match.params.postId
      PostEditActions.getEditPostInfo(postId)
    }
  }

  componentWillUnmount () {
    PostEditStore.unlisten(this.onChange)
  }

  handleSubmit (e) {
    e.preventDefault()

    let content = this.state.content
    if (content === '') {
      PostEditActions.contentValidationFail()
      return
    }

    PostEditActions.editPost({ 'content': content, 'postId': this.props.match.params.postId })
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    return (
      <Form
        title='Edit Post'
        handleSubmit={this.handleSubmit.bind(this)}
        submitState={this.state.formSubmitState}
        message={this.state.message} >

        <TextGroup
          type='text'
          value={this.state.content}
          label='Your Post'
          handleChange={PostEditActions.handleContentChange}
          validationState={this.state.contentValidationState} />

        <Submit
          type='btn-primary'
          value='Edit Post' />

      </Form>
    )
  }
}
