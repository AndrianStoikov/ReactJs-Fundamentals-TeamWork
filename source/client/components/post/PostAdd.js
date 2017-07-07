import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import UserStore from '../../stores/UserStore'
import PostAddStore from '../../stores/PostAddStore'
import PostAddActions from '../../actions/PostAddActions'
import Form from '../form/Form'
import TextGroup from '../form/TextGroup'
import Submit from '../form/Submit'

export default class PostAdd extends Component {
  constructor (props) {
    super(props)
    this.state = PostAddStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    PostAddStore.listen(this.onChange)
    PostAddActions.loadPostAddForm()
  }

  handleSubmit (e) {
    e.preventDefault()

    let content = this.state.content
    if (content === '') {
      PostAddActions.contentValidationFail()
      return
    }

    PostAddActions.addPost({'authorId': UserStore.getState().loggedInUserId, 'content': content})
  }

  render () {
    if (UserStore.getState().loggedInUserId === '') {
      return <Redirect to='/user/login' />
    }

    return (
      <Form
        title='New Post'
        handleSubmit={this.handleSubmit.bind(this)}
        submitState={this.state.formSubmitState}
        message={this.state.message}>

        <TextGroup
          type='text'
          value={this.state.content}
          label='Your Post'
          handleChange={PostAddActions.handleContentChange}
          validationState={this.state.contentValidationState} />

        <Submit
          type='btn-primary'
          value='Post' />

      </Form>
    )
  }
}
