import alt from '../alt'

class BlockUserActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'blockUserSuccess',
      'blockUserFail'
    )
  }

  getUserForBlock (data) {
    let request = {
      url: '/api/user/getByUsername/' + data.usernameForBlock,
      method: 'get',
      data: JSON.stringify(data),
      contentType: 'application/json'
    }

    let cureentUserId = data.currentUserID

    $.ajax(request)
      .done((data) => {
        if (data.length <= 0) {
          return true
        }

        let userForBlockId = data[0]._id

        let dataForRequest = {
          userForBlockId: data[0]._id,
          currentUserId: cureentUserId
        }

        let request = {
          url: '/api/user/block/',
          method: 'post',
          data: JSON.stringify(dataForRequest),
          contentType: 'application/json'
        }

        if (userForBlockId !== cureentUserId) {
          $.ajax(request)
            .done(() => this.blockUserSuccess())
            .fail(err => this.blockUserFail(err))
        } else {
          this.blockUserFail()
        }
      })
      .fail((err) => this.blockUserFail(err))

    return true
  }
}

export default alt.createActions(BlockUserActions)
