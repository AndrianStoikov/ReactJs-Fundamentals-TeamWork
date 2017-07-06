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

  app.get("/api/user/getByUsername/:username", controllers.user.findUserByUsername.get)
  app.post("/api/user/block/", controllers.user.blockUser)


  app.post('/api/post/add', controllers.post.add.post)

  app.all('*', controllers.home.redirectToHome)
}
