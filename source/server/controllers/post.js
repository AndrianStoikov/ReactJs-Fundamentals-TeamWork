const Post = require('../models/Post')

module.exports = {
  add: {
    post: (req, res) => {
      let inputData = req.body
      let postData = {
        author: inputData.authorId,
        content: inputData.content
      }

      Post.create(postData)
        .then(post => {
          if (!post) { return res.status(500).send({message: 'Cannot write post in database'}) }

          res.status(200).send({message: `Post was successfully added!`})
        })
    }
  },
  all: {
    get: (req, res) => {
      // if(req.user) {
      //   res.status(200).send({message: 'Not authorized.'})
      //   return
      // }

      // SHOULD BE FIXED!!!!!!!!
      let userId = '595bf6f9a8a7b9134c1f1bb5'
      Post
        .find({author: userId})
        .then((posts) => {
          res.status(200).send(posts)
        })
    }
  }
}
