import alt from '../alt'

class PostAddActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'addPostSuccess',
      'addPostFail'
    )
  }

  addMovie (data) {
    let request = {
      url: '/api/post/add',
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json'
    }

    $.ajax(request)
      .done(() => {
        this.addPostSuccess()
      })
      .fail((err) => this.addPostFail(err))

    return true
  }
}

export default alt.createActions(PostAddActions)
