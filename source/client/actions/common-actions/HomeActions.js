import alt from '../../alt'
import Data from '../../utilities/DataRequests'

class HomeActions {
  constructor () {
    this.generateActions(
      'getUserPostsSuccess',
      'getUserPostsFail',
      'removePostsSuccess',
      'handlePageChange'
    )
  }

  getUserPosts () {
    let request = Data.get('/api/posts/all', true)

    $.ajax(request)
      .done(data => this.getUserPostsSuccess(data))
      .fail(err => this.getUserPostsFail(err))

    return true
  }
}

export default alt.createActions(HomeActions)
