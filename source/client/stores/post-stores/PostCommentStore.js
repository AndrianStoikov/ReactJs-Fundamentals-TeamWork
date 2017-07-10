import alt from '../../alt'
import PostCommentActions from '../../actions/post-actions/PostCommentActions'

class PostCommentStore {
  constructor () {
    this.bindActions(PostCommentActions)

    this.comment = ''
    this.post = ''
  }
}

export default alt.createStore(PostCommentStore)
