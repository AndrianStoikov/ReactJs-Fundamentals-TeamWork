const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')

module.exports = {
  get: (req, res) => {
    let postId = req.params.postId
    Post
      .findById(postId)
      .populate('comments', 'content author', null, {sort: {dateCreated: 1}})
      .populate('author', 'username')
      .then((post) => {
        if (post === null) {
          res.status(400).send({message: 'Post not found.'})
        }
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
      if (!req.user) {
        res.status(200).send({message: 'Not authorized.'})
        return
      }

      let userId = req.user._id

      User
        .findById(userId)
        .then((user) => {
          Post
            .find({$or: [{author: user._id}, {author: user.follows}]})
            .populate('comments', 'content author', null, {sort: {dateCreated: 1}})
            .populate('author', 'username')
            .sort('-dateCreated')
            .then((posts) => {
              res.status(200).send(posts)
            })
        })
    }
  },
  own: {
    get: (req, res) => {
      let userId = req.params.userId
      Post
        .find({author: userId})
        .populate('comments', 'content author', null, {sort: {dateCreated: 1}})
        .populate('author', 'username')
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
        res.sendStatus(401)
      }
    })
  },
  like: {
    post: (req, res) => {
      let postId = req.params.id

      if (!req.user) {
        res.status(200).send({message: 'Not authorized.'})
        return
      }

      let userId = req.user._id

      Post
        .findByIdAndUpdate(postId, {$addToSet: {likes: userId}})
        .then((post) => {
          res.status(200).send(post)
        })
    }
  },
  unlike: {
    post: (req, res) => {
      let postId = req.params.id

      if (!req.user) {
        res.status(200).send({message: 'Not authorized.'})
        return
      }

      let userId = req.user._id

      Post
        .findByIdAndUpdate(postId, {$pull: {likes: userId}})
        .then((post) => {
          res.status(200).send(post)
        })
    }
  },
  deleteGet: (req, res) => {
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
  deletePost: (req, res) => {
    let postId = req.params.postId
    Post.findById(postId).then(post => {
      if (!post) {
        res.sendStatus(404)
        return
      }
      if (checkIfUserCanEdit(req.user, post.author)) {
        post.remove()
          .then(() => {
            res.status(200).send({message: `Post was successfully removed!`})
          })
      } else {
        res.sendStatus(401)
      }
    })
  },
  commentsPost: (req, res) => {
    let postId = req.params.postId
    let inputData = req.body

    let commentObj = {
      author: req.user._id,
      content: inputData.comment,
      post: postId
    }

    Post
      .findById(postId)
      .then((post) => {
        Comment
          .create(commentObj)
          .then((comment) => {
            post.comments.push(comment._id)
            post
              .save()
              .then(() => res.status(200).send(comment))
          })
      })
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
