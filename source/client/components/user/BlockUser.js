import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import UserStore from '../../stores/user-stores/UserStore'
import BlockUserStore from '../../stores/user-stores/BlockUserStore'
import BlockUserAction from '../../actions/user-actions/BlockUserActions'
import Form from '../form/Form'
import TextGroup from '../form/TextGroup'
import Submit from '../form/Submit'
import Auth from '../../utilities/Auth'

export default class BlockUser extends Component {
  constructor (props) {
    super(props)
    this.state = BlockUserStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    BlockUserStore.listen(this.onChange)
    BlockUserAction.loadBlockUserForm()
  }

  componentWillUnmount () {
    BlockUserStore.unlisten(this.onChange)
  }

  handleSubmit (e) {
    e.preventDefault()

    let content = this.state.content
    if (content === '') {
      BlockUserAction.contentValidationFail()
      return
    }

    BlockUserAction.getUserForBlock({'currentUserID': Auth.getUser()._id, 'usernameForBlock': content})
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    return (
      <Form
        title='Block user'
        handleSubmit={this.handleSubmit.bind(this)}
        submitState={this.state.formSubmitState}
        message={this.state.message} >

        <TextGroup
          type='text'
          value={this.state.content}
          label='Block user'
          handleChange={BlockUserAction.handleContentChange}
          validationState={this.state.contentValidationState} />

        <Submit
          type='btn-primary'
          value='Block' />

      </Form>
    )
  }
}
