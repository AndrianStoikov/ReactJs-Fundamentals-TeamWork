import ProfilePictureAddActions from '../../actions/user-actions/ProfilePictureAddActions'
import alt from '../../alt'

class ProfilePictureAddStore {
  constructor () {
    this.bindActions(ProfilePictureAddActions)

    this.author = ''
    this.image = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
    this.redirect = false
  }

  onAddProfilePictureSuccess (data) {
    this.message = 'Profile picture added'
    this.image = ''
    this.redirect = true
  }

  onAddProfilePictureFail (err) {
    this.message = 'Failed to add profile picture'
    console.log('Failed to add profile picture', err)
  }

  onLoadProfilePictureForm () {
    this.redirect = false
    this.message = ''
  }

  onHandleContentChange (e) {
    this.image = e.target.files[0]
    this.helpBlock = ''
  }

  onContentValidationFail () {
    this.contentValidationState = 'has-error'
    this.message = 'Attach an image file'
    this.formSubmitState = ''
  }
}

export default alt.createStore(ProfilePictureAddStore)
