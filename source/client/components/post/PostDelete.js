import React, { Component } from 'react'
import Auth from '../../utilities/Auth'
import { Redirect, Link } from 'react-router-dom'
import PostDeleteStore from '../../stores/post-stores/PostDeleteStore'
import PostDeleteActions from '../../actions/post-actions/PostDeleteActions'
import Form from '../form/Form'
import Submit from '../form/Submit'

export default class PostDelete extends Component {
  constructor (props) {
    super(props)
    this.state = PostDeleteStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    PostDeleteStore.listen(this.onChange)
    if (Auth.isUserAuthenticated()) {
      let postId = this.props.match.params.postId
      PostDeleteActions.getDeletePostInfo(postId)
    }
  }

  componentWillUnmount () {
    PostDeleteStore.unlisten(this.onChange)
    PostDeleteActions.resetPostDeleteForm()
  }

  handleSubmit (e) {
    e.preventDefault()

    PostDeleteActions.deletePost({ 'postId': this.props.match.params.postId })
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
        title='Delete Post'
        handleSubmit={this.handleSubmit.bind(this)}
        message={this.state.message} >

        <div className='form-group '>
          <label className='control-label' >Your Post</label>
          <input
            type='text' className='form-control'
            value={this.state.content}
            disabled />
          <span className='help-block' >{this.state.message}</span>
        </div>

        <Submit
          type='btn-danger'
          value='Delete Post' />

        <Link className='btn btn-default' to='/'>Cancel</Link>

      </Form>
    )
  }
}
