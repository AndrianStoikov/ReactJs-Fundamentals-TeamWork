import alt from '../alt'
import Data from '../DataRequests'

class AdminPanelActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'makeAdminSuccess',
      'makeAdminFail',
      'loadAdminPanelForm',
      'getAdminsSuccess',
      'getAdminsFail'
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

  getAdmins () {
    let request = Data.get('/user/getAdmins', true)

    $.ajax(request)
      .done((data) => {
        this.getAdminsSuccess(data)
      })
      .fail((err) => this.getAdminsFail(err))

    return true
  }
}

export default alt.createActions(AdminPanelActions)
