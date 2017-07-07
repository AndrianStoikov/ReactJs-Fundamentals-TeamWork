import alt from '../alt'
import Data from '../DataRequests'

class HomeActions {
  constructor () {
    this.generateActions(
      'getUserPostsSuccess',
      'getUserPostsFail',
      'removePostsSuccess'
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
