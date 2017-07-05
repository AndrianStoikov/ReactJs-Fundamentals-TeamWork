module.exports = (product, user) => {
  let isAuthor = product.creator.equals(user._id)
  let isAdmin = user.roles.indexOf('Admin') >= 0

  return isAuthor || isAdmin
}

module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      next()
    } else {
      res.status(401).send({message: 'Not authorized.'})
    }
  },
  isInRole: (role) => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.roles.indexOf(role) > -1) {
        next()
      } else {
        res.redirect('/')
      }
    }
  }
}
