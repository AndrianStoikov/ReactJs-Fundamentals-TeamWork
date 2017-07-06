const controllers = require('../controllers')

module.exports = (app) => {
  // User routes
  app.get('/', controllers.home.getHome)

  app.post('/api/posts/add', controllers.post.add.post)
  app.get('/api/posts/all', controllers.post.all.get)

  app.post('/user/register', controllers.user.register.post)
  app.post('/user/login', controllers.user.login.post)
  app.post('/user/logout', controllers.user.logout)
  app.get('/api/user/:userId', controllers.user.profile.get)

  app.post('/api/post/add', controllers.post.add.post)
  app.get('/api/post/edit/:postId', controllers.post.editGet)
  app.post('/api/post/edit/:postId', controllers.post.editPost)

  app.all('*', controllers.home.redirectToHome)
}
