import alt from '../alt'
import Data from '../DataRequests'

class AdminPanelActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'makeAdminSuccess',
      'makeAdminFail',
      'loadAdminPanelForm'
    )
  }

  addPost (data) {
    let request = Data.post('/api/user/makeAdmin', data, true)
    $.ajax(request)
      .done(() => {
        this.makeAdminSuccess()
      })
      .fail((err) => this.makeAdminFail(err))

    return true
  }
}

export default alt.createActions(AdminPanelActions)
