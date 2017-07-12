import BlockUserActions from '../actions/BlockUserActions'
import alt from '../alt'

class BlockUserStore {
  constructor () {
    this.bindActions(BlockUserActions)

    this.content = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
  }

  onBlockYourProfileError () {
    this.contentValidationState = 'has-error'
    this.message = 'You cannot block your profile'
    this.formSubmitState = ''
  }

  onBlockUserSuccess () {
    this.content = ''
    this.contentValidationState = ''
    this.message = 'User blocked'
    this.formSubmitState = ''
  }

  onHandleContentChange (e) {
    this.content = e.target.value
  }

  onUserNotExist () {
    this.contentValidationState = 'has-error'
    this.message = 'This user doesn\'t exist'
    this.formSubmitState = ''
  }

  onBlockUserWhoIsBlockedError () {
    this.contentValidationState = 'has-error'
    this.message = 'This user is blocked'
    this.formSubmitState = ''
  }

  onContentValidationFail () {
    this.contentValidationState = 'has-error'
    this.message = 'Enter username of user who want to block'
    this.formSubmitState = ''
  }

  onLoadBlockUserForm () {
    this.content = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
  }
}

export default alt.createStore(BlockUserStore)
