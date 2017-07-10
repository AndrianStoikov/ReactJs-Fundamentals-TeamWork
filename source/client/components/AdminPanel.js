import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Auth from '../components/Auth'
import AdminPanelStore from '../stores/AdminPanelStore'
import AdminPanelActions from '../actions/AdminPanelActions'
import Form from './form/Form'
import TextGroup from './form/TextGroup'
import Submit from './form/Submit'

export default class AdminPanel extends Component {
  constructor (props) {
    super(props)
    this.state = AdminPanelStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    AdminPanelStore.listen(this.onChange)
    AdminPanelActions.loadAdminPanelForm()
    AdminPanelActions.getAdmins()
  }

  componentWillUnmount () {
    AdminPanelStore.unlisten(this.onChange)
  }

  handleSubmit (e) {
    e.preventDefault()

    let userForAdmin = this.state.userForAdmin
    if (userForAdmin === '') {
      AdminPanelActions.contentValidationFail()
      return
    }

    AdminPanelActions.addPost({ 'userForAdmin': userForAdmin })
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    if (JSON.parse(window.localStorage.getItem('user')).roles.indexOf('Admin') < 0) {
      return <Redirect to='/user/login' />
    }

    let admins = this.state.admins.map((admin, index) => {
      return (
        <li key={admin._id} className='list-group-item'>
          {admin.username}
        </li>
      )
    })

    return (
      <div>
        <Form
          title='Make Admin'
          handleSubmit={this.handleSubmit.bind(this)}
          submitState={this.state.formSubmitState}
          message={this.state.message}>

          <TextGroup
            type='text'
            value={this.state.userForAdmin}
            label='Username'
            handleChange={AdminPanelActions.handleContentChange}
            validationState={this.state.contentValidationState} />

          <Submit
            type='btn-primary'
            value='Make Admin' />

        </Form>
        <div className='container' >
          <div className='row flipInX animated' >
            <div className='col-sm-8' >
              <div className='panel panel-default' >
                <div className='panel-heading' >Current admins</div>
                <div className='panel-body' >
                  <ul className='list-group'>
                    {admins}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
