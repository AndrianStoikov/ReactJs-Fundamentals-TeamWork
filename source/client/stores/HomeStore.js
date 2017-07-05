import alt from '../alt'
import HomeActions from '../actions/HomeActions'

class HomeStore {
  constructor () {
    this.bindActions(HomeActions)

    this.posts = []
  }

  onGetUserPostsSuccess (data) {
    this.posts = data
  }

  onRemovePostsSuccess () {
    this.posts = []
  }
}

export default alt.createStore(HomeStore)
