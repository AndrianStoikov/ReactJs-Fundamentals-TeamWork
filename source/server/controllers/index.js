const postController = require('./post')
const commentController = require('./comment')
const userController = require('./user')

module.exports = {
  post: postController,
  comment: commentController,
  user: userController
}
