import alt from '../alt'
import Data from '../DataRequests'
import toastr from 'toastr'

class PostDeleteActions {
  constructor () {
    this.generateActions(
      'deletePostSuccess',
      'deletePostFail',
      'getDeletePostInfoFail',
      'getDeletePostInfoSuccess',
      'resetPostDeleteForm'
    )
  }

  getDeletePostInfo (postId) {
    let request = Data.get(`/api/post/delete/${postId}`, true)

    $.ajax(request)
      .done((data) => {
        this.getDeletePostInfoSuccess(data)
      })
      .fail((err) => {
        console.log(err)
        this.getDeletePostInfoFail(err)
      })

    return true
  }

  deletePost (data) {
    let request = Data.post(`/api/post/delete/${data.postId}`, data, true)

    $.ajax(request)
      .done((data) => {
        toastr.info('Post deleted')
        this.deletePostSuccess(data)
      })
      .fail((err) => {
        console.log(err)
        this.deletePostFail(err)
      })

    return true
  }
}

export default alt.createActions(PostDeleteActions)
