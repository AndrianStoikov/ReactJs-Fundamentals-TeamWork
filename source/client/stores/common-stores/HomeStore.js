import alt from '../../alt'
import HomeActions from '../../actions/common-actions/HomeActions'

class HomeStore {
  constructor () {
    this.bindActions(HomeActions)

    this.posts = []
    this.pageCount = 0
    this.offset = 0
    this.postsToDisplay = []
  }

  onGetUserPostsSuccess (data) {
    this.posts = data
    this.pageCount = data.length / 10
    this.postsToDisplay = this.posts.slice(this.offset, this.offset + 10)
  }

  onRemovePostsSuccess () {
    this.posts = []
    this.pageCount = 0
    this.offset = 0
    this.postsToDisplay = []
  }

  onHandlePageChange (offset) {
    this.offset = offset
    this.postsToDisplay = this.posts.slice(offset, offset + 10)
  }
}

export default alt.createStore(HomeStore)
