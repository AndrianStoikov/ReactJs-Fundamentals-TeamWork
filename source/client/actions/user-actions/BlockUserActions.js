import alt from '../../alt'
import Auth from '../../utilities/Auth'

class BlockUserActions {
    constructor() {
        this.generateActions(
            'handleContentChange',
            'contentValidationFail',
            'blockUserSuccess',
            'blockUserFail',
            'blockUserWhoIsBlockedError',
            'userNotExist',
            'blockYourProfileError',
            'loadBlockUserForm'
        )
    }

    getUserForBlock(data) {
        let request = {
            url: '/user/getByUsername/' + data.usernameForBlock,
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

                let dataForRequest = {
                    userForBlockId: data[0]._id,
                    currentUserId: cureentUserId
                }

                console.log(dataForRequest)

                let request = {
                    url: '/api/user/block/',
                    method: 'post',
                    data: JSON.stringify(dataForRequest),
                    contentType: 'application/json',
                    headers: {
                        'Authorization': `bearer ${Auth.getToken()}`
                    }
                }

                if (dataForRequest.userForBlockId !== cureentUserId) {
                    $.ajax(request)
                        .done(() => this.blockUserSuccess())
                        .fail(err => {
                            this.blockUserWhoIsBlockedError()
                        })
                } else {
                    this.blockYourProfileError()
                }

            })
            .fail((err) => this.userNotExist())

        return true
    }
}

export default alt.createActions(BlockUserActions)
