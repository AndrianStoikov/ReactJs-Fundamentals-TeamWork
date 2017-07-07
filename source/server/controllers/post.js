const Post = require('../models/Post')

module.exports = {
  get: (req, res) => {
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
  editGet: (req, res) => {
    let postId = req.params.postId
    Post.findById(postId).then((post) => {
      if (!post) {
        res.sendStatus(404)
        return
      }
      let canEdit = checkIfUserCanEdit(req.user, post.author)
      if (canEdit) {
        res.status(200).send(post)
      } else {
        res.sendStatus(404)
      }
    })
  },
  editPost: (req, res) => {
    let postId = req.params.postId
    let editedPost = req.body
    Post.findById(postId).then(post => {
      if (!post) {
        res.sendStatus(404)
        return
      }
      if (checkIfUserCanEdit(req.user, post.author)) {
        post.content = editedPost.content
        post.save()
          .then(() => {
            res.status(200).send({message: `Post was successfully edited!`})
          })
      } else {
        res.sendStatus(404)
      }
    })
  },
  like: {
    post: (req, res) => {
      // METHOD SHOULD BE FIXED SO THE RIGHT USER CAN LIKE THE POST
      let postId = req.params.id
      let userid = '595bf6f9a8a7b9134c1f1bb5'
      Post
        .findByIdAndUpdate(postId, {$push: {likes: userid}})
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

function checkIfUserCanEdit (currUser, authorId) {
  if (currUser._id.toString() === authorId.toString()) {
    return true
  }
  if (currUser.roles.indexOf('Admin') >= 0) {
    return true
  }
  return false
}
