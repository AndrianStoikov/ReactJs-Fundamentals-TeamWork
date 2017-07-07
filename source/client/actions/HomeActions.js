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
      .done(data => HomeActions.getUserPostsSuccess(data))
      .fail(err => HomeActions.getUserPostsFail(err))
  }
}

export default alt.createActions(HomeActions)
