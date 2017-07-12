import alt from '../alt'
import Data from '../DataRequests'

class SearchedUserActions {
  constructor () {
    this.generateActions(
      'getUsersSuccess',
      'getUserFail'
    )
  }

  getUsers(username) {
    let request = Data.get(`/api/users/findByName/${username}`, true)

    $.ajax(request)
      .done((users) => {
        this.getUsersSuccess(users)
      })
  }
}

export default alt.createActions(SearchedUserActions)
