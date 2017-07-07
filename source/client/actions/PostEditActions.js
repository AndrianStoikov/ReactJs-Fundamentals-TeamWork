import alt from '../alt'

class PostEditActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'editPostSuccess',
      'editPostFail',
      'getEditPostInfoFail',
      'getEditPostInfoSuccess'
    )
  }

  getEditPostInfo (postId) {
    let request = {
      url: `/api/post/edit/${postId}`,
      method: 'GET',
      contentType: 'application/json'
    }
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
    let request = {
      url: `/api/post/edit/${data.postId}`,
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json'
    }
    $.ajax(request)
      .done((data) => {
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
