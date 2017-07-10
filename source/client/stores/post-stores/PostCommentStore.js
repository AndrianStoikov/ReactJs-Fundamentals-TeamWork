import alt from '../../alt'
import PostCommentActions from '../../actions/post-actions/PostCommentActions'

class PostCommentStore {
  constructor () {
    this.bindActions(PostCommentActions)

    this.comments = []
    this.comment = ''
    this.formSubmitState = ''
    this.message = ''
    this.post = {
      content: '',
      likes: []
    }

    this.editCommentFormSubmitState = ''
    this.editCommentMessage = ''
    this.editContent = ''
    this.editCommentContentValidationState = ''
    this.redirect = false

    this.deleteCommentMessage = ''
  }

  onCommentValidationFail () {
    this.message = 'Comment can\'t be empty!'
    this.formSubmitState = 'has-error'
  }

  onHandleCommentChange (e) {
    this.comment = e.target.value
    this.message = ''
  }

  onAddCommentSuccess () {
    this.comment = ''
    this.message = 'Comment added'
  }

  onGetPostInfoSuccess (post) {
    this.post = post
    this.comments = post.comments
  }

  onGetCommentInfoSuccess (comment) {
    this.redirect = false
    this.comment = ''
    this.message = ''
    this.contentValidationState = ''

    this.deleteCommentMessage = ''
    this.deleteCommentMessage = ''

    this.formSubmitState = ''
    this.editContent = comment.content
  }

  onHandleEditCommentChange (e) {
    this.editContent = e.target.value
  }

  onEditContentValidationFail () {
    this.redirect = false
    this.contentValidationState = 'has-error'
    this.message = 'Enter comment content'
    this.formSubmitState = ''
  }

  onEditCommentValidationFail () {
    this.editCommentFormSubmitState = 'has-error'
    this.editCommentMessage = 'Comment can\'t be empty.'
  }

  onEditCommentSuccess (post) {
    this.redirect = true
    this.editContent = ''
    this.editCommentContentValidationState = ''
    this.editCommentMessage = 'Post edited'
    this.editCommentFormSubmitState = ''
  }

  onEditCommentFail (err) {
    this.redirect = false
    this.editCommentFormSubmitState = 'has-error'
    console.log('Failed to edit comment', err)
  }

  onDeleteCommentSuccess () {
    this.deleteCommentMessage = 'Comment deleted'
    this.redirect = true
  }

  onDeleteCommentFail () {
    this.deleteCommentMessage = 'Delete failed'
    this.redirect = false
  }

  onClearRedirectSuccess () {
    this.redirect = false
  }
}

export default alt.createStore(PostCommentStore)
