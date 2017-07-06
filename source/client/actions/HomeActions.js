import alt from '../alt'

class HomeActions {
  constructor () {
    this.generateActions(
      'getUserPostsSuccess',
      'getUserPostsFail',
      'removePostsSuccess'
    )
  }
}

export default alt.createActions(HomeActions)
