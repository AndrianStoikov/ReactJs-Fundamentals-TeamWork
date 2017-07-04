const postController = require('./post')
const commentController = require('./comment')
const userController = require('./user')
const homeController = require('./home')

module.exports = {
  post: postController,
  comment: commentController,
  user: userController,
  home: homeController
}
