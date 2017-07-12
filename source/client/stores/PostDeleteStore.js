import PostDeleteActions from '../actions/PostDeleteActions'
import alt from '../alt'

class PostDeleteStore {
  constructor () {
    this.bindActions(PostDeleteActions)

    this.author = ''
    this.content = ''
    this.message = ''
    this.redirect = false
  }

  onGetDeletePostInfoSuccess (data) {
    this.message = ''
    this.content = data.content
  }

  onGetDeletePostInfoFail (err) {
    this.message = 'Failed to load info'
    console.log('Failed to load info', err)
  }

  onDeletePostSuccess (post) {
    console.log('Post deleted')
    this.message = 'Post deleted'
    this.content = ''
    this.redirect = true
  }

  onDeletePostFail (err) {
    console.log('Failed to edit post', err)
  }

  onResetPostDeleteForm () {
    this.content = ''
    this.message = ''
    this.redirect = false
  }
}

export default alt.createStore(PostDeleteStore)
