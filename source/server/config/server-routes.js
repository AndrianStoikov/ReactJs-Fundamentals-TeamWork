const controllers = require('../controllers')
const authCheck = require('../middleware/auth-check')

module.exports = (app) => {
  // User routes
  app.get('/', controllers.home.getHome)

  app.post('/user/register', controllers.user.register.post)
  app.post('/user/login', controllers.user.login.post)
  app.post('/user/logout', controllers.user.logout)
  app.get('/api/user/:userId', controllers.user.profile.get)

  app.get('/api/posts/all', authCheck, controllers.post.all.get)
  app.get('/api/post/:postId', authCheck, controllers.post.get)
  app.post('/api/post/add', authCheck, controllers.post.add.post)
  app.get('/api/post/edit/:postId', authCheck, controllers.post.editGet)
  app.post('/api/post/edit/:postId', authCheck, controllers.post.editPost)
  app.get('/api/post/own/:userId', authCheck, controllers.post.own.get)
  app.post('/api/post/like/:id', authCheck, controllers.post.like.post)
  app.post('/api/post/unlike/:id', authCheck, controllers.post.unlike.post)

  app.get('/api/user/getByUsername/:username', controllers.user.findUserByUsername.get)
  app.post('/api/user/block/', authCheck, controllers.user.blockUser)
  app.post('/api/user/makeAdmin', authCheck, controllers.user.makeAdmin)

  app.all('*', controllers.home.redirectToHome)
}
