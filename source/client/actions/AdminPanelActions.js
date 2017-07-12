import alt from '../alt'
import Data from '../DataRequests'
import toastr from 'toastr'

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

  addAdmin (data) {
    let request = Data.post('/api/user/makeAdmin', data, true)
    $.ajax(request)
      .done(() => {
        this.makeAdminSuccess()
      })
      .fail((err) => {
        this.makeAdminFail(err)
        toastr.error(JSON.parse(err.responseText).message)
      })

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
