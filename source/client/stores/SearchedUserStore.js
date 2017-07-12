import alt from '../alt'
import SearchedUserActions from '../actions/SearchedUserActions'

class SearchedUserStore {
    constructor () {
        this.bindActions(SearchedUserActions)
    }
}

export default alt.createStore(SearchedUserStore)
