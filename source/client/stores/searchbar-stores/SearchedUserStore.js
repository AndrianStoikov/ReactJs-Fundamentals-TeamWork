import alt from '../../alt'
import SearchedUserActions from '../../actions/searchbar-actions/SearchedUserActions'

class SearchedUserStore {
  constructor () {
    this.bindActions(SearchedUserActions)
    this.users = []
  }

  onGetUsersSuccess (users) {
    this.users = users
  }
}

export default alt.createStore(SearchedUserStore)
