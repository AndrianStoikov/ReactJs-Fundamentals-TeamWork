import alt from '../../alt'
import Data from '../../DataRequests'
import toastr from 'toastr'

class PostEditActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'editPostSuccess',
      'editPostFail',
      'getEditPostInfoFail',
      'getEditPostInfoSuccess',
      'resetPostEditForm'
    )
  }

  getEditPostInfo (postId) {
    let request = Data.get(`/api/post/edit/${postId}`, true)

    $.ajax(request)
      .done((data) => {
        this.getEditPostInfoSuccess(data)
      })
      .fail((err) => {
        console.log(err)
        this.getEditPostInfoFail(err)
      })

    return true
  }

  editPost (data) {
    let request = Data.post(`/api/post/edit/${data.postId}`, data, true)

    $.ajax(request)
      .done((data) => {
        toastr.success('Post edited')
        this.editPostSuccess(data)
      })
      .fail((err) => {
        console.log(err)
        this.editPostFail(err)
      })

    return true
  }
}

export default alt.createActions(PostEditActions)
