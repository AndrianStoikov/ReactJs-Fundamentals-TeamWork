import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom'
import Auth from '../../components/Auth'
import PostAddStore from '../../stores/post-stores/PostAddStore'
import PostAddActions from '../../actions/post-actions/PostAddActions'
import Form from '../form/Form'
import TextArea from '../form/TextArea'
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
  }

  componentWillUnmount () {
    PostAddStore.unlisten(this.onChange)
    PostAddActions.resetPostAddForm()
  }

  handleSubmit (e) {
    e.preventDefault()

    let content = this.state.content
    if (content === '') {
      PostAddActions.contentValidationFail()
      return
    }

    PostAddActions.addPost({'authorId': Auth.getUser()._id, 'content': content})
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    if (this.state.redirect === true) {
      return <Redirect to='/' />
    }

    return (
      <Form
        title='New Post'
        handleSubmit={this.handleSubmit.bind(this)}
        submitState={this.state.formSubmitState}
        message={this.state.message}>

        <TextArea
          type='text'
          value={this.state.content}
          label='Your Post'
          handleChange={PostAddActions.handleContentChange}
          validationState={this.state.contentValidationState}
          additionalClass='post-input-field' />

        <Submit
          type='btn-primary'
          value='Post' />

        <Link className='btn btn-default' to='/'>Cancel</Link>

      </Form>
    )
  }
}
