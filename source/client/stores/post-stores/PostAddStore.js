import PostAddActions from '../../actions/post-actions/PostAddActions'
import alt from '../../alt'

class PostAddStore {
  constructor () {
    this.bindActions(PostAddActions)

    this.author = ''
    this.content = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
    this.redirect = false
  }

  onAddPostSuccess (post) {
    console.log('Added post')
    this.content = ''
    this.contentValidationState = ''
    this.message = 'Post added'
    this.formSubmitState = ''
    this.redirect = true
  }

  onAddPostFail (err) {
    console.log('Failed to add post', err)
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

  onResetPostAddForm () {
    this.content = ''
    this.contentValidationState = ''
    this.message = ''
    this.formSubmitState = ''
    this.redirect = false
  }
}

export default alt.createStore(PostAddStore)
