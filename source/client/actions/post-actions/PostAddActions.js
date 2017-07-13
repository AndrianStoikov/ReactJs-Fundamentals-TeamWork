import alt from '../../alt'
import Data from '../../utilities/DataRequests'
import toastr from 'toastr'

class PostAddActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'addPostSuccess',
      'addPostFail',
      'resetPostAddForm'
    )
  }

  addPost (data) {
    let request = Data.post('/api/post/add', data, true)
    $.ajax(request)
      .done(() => {
        toastr.success('Post added')
        this.addPostSuccess()
      })
      .fail((err) => {
        this.addPostFail(err)
      })

    return true
  }
}

export default alt.createActions(PostAddActions)
