module.exports.getHome = (req, res) => {
  res.status(200).end()
}

module.exports.redirectToHome = (req, res) => {
  res.redirect('/')
}
