const Post = require('../models/Post')

module.exports = {
  get: (req ,res) => {
    let postId = req.postId
    Post
      .findById(postId)
      .then((post) => {
         res.status(200).send(post)
      })
  },
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
        .sort('-dateCreated')
        .then((posts) => {
          res.status(200).send(posts)
        })
    }
  },
  own: {
    get: (req, res) => {
      let userId = req.params.userId
      Post
        .find({author: userId})
        .sort('-dateCreated')
        .then((posts) => {
          res.status(200).send(posts)
        })
    }
  },
  like: {
    post: (req, res) => {
      // METHOD SHOULD BE FIXED SO THE RIGHT USER CAN LIKE THE POST
      let postId = req.params.id
      let userid = '595bf6f9a8a7b9134c1f1bb5'
      Post
        .findByIdAndUpdate(postId, {$addToSet: {likes: userid}})
        .then((post) => {
          res.status(200).send(post)
        })
    }
  },
  unlike: {
    post: (req, res) => {
      // METHOD SHOULD BE FIXED SO THE RIGHT USER CAN LIKE THE POST
      let postId = req.params.id
      let userid = '595bf6f9a8a7b9134c1f1bb5'
      Post
        .findByIdAndUpdate(postId, {$pull: {likes: userid}})
        .then((post) => {
          res.status(200).send(post)
        })
    }
  }
}
