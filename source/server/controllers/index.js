const postController = require('./post')
const commentController = require('./comment')
const userController = require('./user')
const homeController = require('./home')
const threadController = require('./thread')
const messageController = require('./message')

module.exports = {
  post: postController,
  comment: commentController,
  user: userController,
  home: homeController,
  thread: threadController,
  message: messageController
}
