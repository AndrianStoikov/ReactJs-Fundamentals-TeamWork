const controllers = require('../controllers')
const authCheck = require('../middleware/auth-check')
const multer = require('multer')

let upload = multer({dest: './public/images'})

module.exports = (app) => {
  // User routes
  app.get('/', controllers.home.getHome)

  app.post('/user/register', controllers.user.register.post)
  app.post('/user/login', controllers.user.login.post)
  app.post('/user/logout', controllers.user.logout)
  app.get(`/api/users/findByName/:username`, authCheck, controllers.user.getByName)
  app.get('/api/user/:userId', controllers.user.profile.get)
  app.get('/api/user/:firstUserId/:secondUserId', controllers.user.profile.getMultiple)

  app.get('/api/posts/all', authCheck, controllers.post.all.get)
  app.get('/api/post/:postId', authCheck, controllers.post.get)
  app.post('/api/post/add', authCheck, controllers.post.add.post)
  app.get('/api/post/edit/:postId', authCheck, controllers.post.editGet)
  app.post('/api/post/edit/:postId', authCheck, controllers.post.editPost)
  app.get('/api/post/own/:userId', authCheck, controllers.post.own.get)
  app.post('/api/post/like/:id', authCheck, controllers.post.like.post)
  app.post('/api/post/unlike/:id', authCheck, controllers.post.unlike.post)
  app.get('/api/post/delete/:postId', authCheck, controllers.post.deleteGet)
  app.post('/api/post/delete/:postId', authCheck, controllers.post.deletePost)
  app.post('/api/post/comments/:postId', authCheck, controllers.post.commentsPost)

  app.get('/api/threads', authCheck, controllers.thread.getUserThreads)
  app.get('/api/thread/:username', authCheck, controllers.thread.getThreadMessages)
  app.post('/api/message/add/:threadId', authCheck, controllers.message.addPost)

  app.get('/api/user/getByUsername/:username', controllers.user.findUserByUsername.get)
  app.post('/api/user/block/', authCheck, controllers.user.blockUser)
  app.post('/api/user/makeAdmin', authCheck, controllers.user.makeAdmin)
  app.get('/user/getAdmins', authCheck, controllers.user.getAdmins)
  app.post('/api/user/profile-picture/:userId', authCheck, upload.single('image'), controllers.user.addProfilePicture)
  app.post('/api/user/follow/:id', authCheck, controllers.user.follow)
  app.post('/api/user/unfollow/:id', authCheck, controllers.user.unfollow)

  app.get('/api/comment/:id', authCheck, controllers.comment.get)
  app.post('/api/comment/edit/:id', authCheck, controllers.comment.edit)
  app.post('/api/comment/delete/:id', authCheck, controllers.comment.delete)

  app.all('*', controllers.home.redirectToHome)
}
