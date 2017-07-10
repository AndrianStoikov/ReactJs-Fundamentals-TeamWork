import alt from '../../alt'
import Data from '../../DataRequests'

class PostCommentActions {
  constructor () {
    this.generateActions(
      'addCommentSuccess',
      'commentValidationFail',
      'handleCommentChange',
      'getPostInfoSuccess',
      'getCommentInfoSuccess',
      'getCommentInfoFail',
      'handleEditCommentChange',
      'editCommentValidationFail',
      'editCommentSuccess',
      'editCommentFail',
      'deleteCommentSuccess',
      'deleteCommentFail',
      'clearRedirectSuccess'
    )
  }

  addComment (postId, comment) {
    let request = Data.post(`/api/post/comments/${postId}`, {comment: comment}, true)

    $.ajax(request)
      .done(() => {
        this.addCommentSuccess()
        this.getPostInfo(postId)
      })
      .fail(() => console.log('Could\'t add comment'))

    return true
  }

  getPostInfo (postId) {
    let request = Data.get(`/api/post/${postId}`, true)

    $.ajax(request)
      .done((post) => this.getPostInfoSuccess(post))
      .fail(() => console.log('Could\'t get post info'))

    return true
  }

  getCommentInfo (commentId) {
    let request = Data.get(`/api/comment/${commentId}`, true)

    $.ajax(request)
      .done((comment) => this.getCommentInfoSuccess(comment))
      .fail((err) => this.getCommentInfoFail(err))

    return true
  }

  editComment (commentId, data) {
    let request = Data.post(`/api/comment/edit/${commentId}`, data, true)

    $.ajax(request)
      .done((comment) => this.editCommentSuccess(comment))
      .fail((err) => this.editCommentFail(err))
    return true
  }

  deleteComment (commentId) {
    let requst = Data.post(`/api/comment/delete/${commentId}`, {}, true)

    $.ajax(requst)
      .done(() => this.deleteCommentSuccess())
      .fail(() => this.deleteCommentFail())

    return true
  }
}

export default alt.createActions(PostCommentActions)
