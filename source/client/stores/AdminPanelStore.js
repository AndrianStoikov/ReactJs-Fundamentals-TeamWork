import AdminPanelActions from '../actions/AdminPanelActions'
import alt from '../alt'

class AdminPanelStore {
  constructor () {
    this.bindActions(AdminPanelActions)

    this.userForAdmin = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
  }

  onMakeAdminSuccess (post) {
    console.log('Added post')
    this.userForAdmin = ''
    this.contentValidationState = ''
    this.message = 'Admin added'
    this.formSubmitState = ''
  }

  onMakeAdminFail (err) {
    console.log('Failed to add admin', err)
  }

  onHandleContentChange (e) {
    this.userForAdmin = e.target.value
    this.helpBlock = ''
  }

  onContentValidationFail () {
    this.contentValidationState = 'has-error'
    this.message = 'Enter username'
    this.formSubmitState = ''
  }

  onLoadAdminPanelForm () {
    this.userForAdmin = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
  }
}

export default alt.createStore(AdminPanelStore)
