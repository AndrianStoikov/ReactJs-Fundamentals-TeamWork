const controllers = require('../controllers')

module.exports = (app) => {
  // User routes
  app.get('/', controllers.home.getHome)

  app.post('/user/register', controllers.user.register.post)
  app.post('/user/login', controllers.user.login.post)
  app.post('/user/logout', controllers.user.logout)
  app.get('/api/user/:userId', controllers.user.profile.get)
}
