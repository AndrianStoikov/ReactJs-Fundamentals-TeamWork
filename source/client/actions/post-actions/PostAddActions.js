import alt from '../alt'
import Data from '../DataRequests'

class PostAddActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'addPostSuccess',
      'addPostFail',
      'loadPostAddForm'
    )
  }

  addPost (data) {
    let request = Data.post('/api/post/add', data, true)
    $.ajax(request)
      .done(() => {
        this.addPostSuccess()
      })
      .fail((err) => this.addPostFail(err))

    return true
  }
}

export default alt.createActions(PostAddActions)
