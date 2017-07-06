import alt from '../alt'

class FormActions {
  constructor () {
    this.generateActions(
      'handleUsernameChange',
      'handlePasswordChange',
      'handleConfirmedPasswordChange',
      'handleFirstNameChange',
      'handleLastNameChange',
      'handleAgeChange',
      'handleGenderChange',
      'usernameValidationFail',
      'passwordValidationFail',
      'unauthorizedAccessAttempt'
    )
  }
}

export default alt.createActions(FormActions)
