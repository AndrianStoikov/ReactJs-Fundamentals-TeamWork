const Post = require('../models/Post')

module.exports = {
  add: {
    post: (req, res) => {
      let inputData = req.body
      let postData = {
        author: req.user._id,
        content: inputData.content
      }

      Post.create(postData)
        .then(post => {
          if (!post) { return res.status(500).send({message: 'Cannot write post in database'}) }

          res.status(200).send({message: `Post was successfully added!`})
        })
    }
  }
}
