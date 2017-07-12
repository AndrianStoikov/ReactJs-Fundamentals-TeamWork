import React, { Component } from 'react'
import Auth from '../components/Auth'
import { Redirect } from 'react-router-dom'
import ProfilePictureAddStore from '../stores/ProfilePictureAddStore'
import ProfilePictureAddActions from '../actions/ProfilePictureAddActions'
import ImageForm from './form/ImageForm'
import Submit from './form/Submit'

export default class ProfilePictureAdd extends Component {
  constructor (props) {
    super(props)
    this.state = ProfilePictureAddStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    ProfilePictureAddStore.listen(this.onChange)
  }

  componentWillUnmount () {
    ProfilePictureAddStore.unlisten(this.onChange)
    ProfilePictureAddActions.loadProfilePictureForm()
  }

  handleSubmit (e) {
    e.preventDefault()

    let image = this.state.image
    if (image === '') {
      ProfilePictureAddActions.contentValidationFail()
      return
    }
    ProfilePictureAddActions.addProfilePicture({ 'image': image, userId: Auth.getUser()._id })
  }

  render () {
    if (!Auth.isUserAuthenticated()) {
      return <Redirect to='/user/login' />
    }

    if (this.state.redirect === true) {
      return <Redirect to={`/user/profile/${Auth.getUser()._id}`} />
    }

    return (
      <ImageForm
        title='Add New Profile Picture'
        handleSubmit={this.handleSubmit.bind(this)}
        submitState={this.state.formSubmitState}
        message={this.state.message} >

        <input
          type='file'
          name='image'
          label='Your New Profile Image'
          onChange={ProfilePictureAddActions.handleContentChange}
          validationState={this.state.contentValidationState} />

        <Submit
          type='btn-primary'
          value='Add Image' />

      </ImageForm>
    )
  }
}
