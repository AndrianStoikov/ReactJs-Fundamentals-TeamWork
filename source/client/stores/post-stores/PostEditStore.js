import PostEditActions from '../../actions/post-actions/PostEditActions'
import alt from '../../alt'

class PostEditStore {
  constructor () {
    this.bindActions(PostEditActions)

    this.author = ''
    this.content = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
    this.redirect = false
  }

  onGetEditPostInfoSuccess (data) {
    this.message = ''
    this.content = data.content
  }

  onGetEditPostInfoFail (err) {
    this.message = 'Failed to load edit info'
    console.log('Failed to load edit info', err)
  }

  onEditPostSuccess (post) {
    console.log('Post edited')
    this.contentValidationState = ''
    this.message = 'Post edited'
    this.formSubmitState = ''
    this.redirect = true
  }

  onEditPostFail (err) {
    console.log('Failed to edit post', err)
  }

  onHandleContentChange (e) {
    this.content = e.target.value
    this.helpBlock = ''
  }

  onContentValidationFail () {
    this.contentValidationState = 'has-error'
    this.message = 'Enter post content'
    this.formSubmitState = ''
  }

  onResetPostEditForm () {
    this.content = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
    this.redirect = false
  }
}

export default alt.createStore(PostEditStore)
