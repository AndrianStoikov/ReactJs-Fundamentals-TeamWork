import alt from '../../alt'
import Data from '../../utilities/DataRequests'

class SearchBarActions {
    constructor () {
        this.generateActions(
            'handleContentChange',
            'contentValidationFail',
            'loadSearchBarForm'
        )
    }

    searchUsers (data) {
        let request = Data.post('/api/post/add', data, true)
        $.ajax(request)
            .done(() => {
                //this.addPostSuccess()
            })
            .fail(
                //(err) => this.addPostFail(err)
            )

        return true
    }
}

export default alt.createActions(SearchBarActions)
