import React, { Component } from 'react'
import Auth from '../../components/Auth'
import { Redirect, Link } from 'react-router-dom'
import PostDeleteStore from '../../stores/PostDeleteStore'
import PostDeleteActions from '../../actions/PostDeleteActions'
import Form from '../form/Form'
import TextGroup from '../form/TextGroup'
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
  }

  handleSubmit (e) {
    e.preventDefault()

    PostDeleteActions.deletePost({ 'postId': this.props.match.params.postId })
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
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
