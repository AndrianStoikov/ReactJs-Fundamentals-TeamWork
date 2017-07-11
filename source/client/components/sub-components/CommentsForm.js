import React, { Component } from 'react'

import PostCommentStore from '../../stores/post-stores/PostCommentStore'
import PostCommentActions from '../../actions/post-actions/PostCommentActions'

export default class CommentsForm extends Component {
  constructor (props) {
    super(props)

    this.state = PostCommentStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    PostCommentStore.listen(this.onChange)
  }

  componentWillUnmount () {
    PostCommentStore.unlisten(this.onChange)
  }

  handleSubmit (e) {
    e.preventDefault()

    if (!this.state.comment) {
      PostCommentActions.commentValidationFail()
      return
    }

    PostCommentActions.addComment(this.state.post._id, this.state.comment)
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit.bind(this)} >
        <div className={`form-group ${this.state.commentValidationState}`} >
          <label className='control-label' htmlFor='content' >Add comment</label>
          <textarea
            id='content'
            className='form-control'
            value={this.state.comment}
            onChange={PostCommentActions.handleCommentChange}
            rows='5' />
          <span className={`help-block`} >{ this.state.message }</span>
        </div>
        <div className='form-group' >
          <input type='submit' className='btn btn-primary' value='Comment' />
        </div>
      </form>
    )
  }

}
