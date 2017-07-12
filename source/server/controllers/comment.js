const Comment = require('../models/Comment')
const User = require('../models/User')

module.exports = {
  getPostComments: {
    get: (req, res) => {
      let postId = req.params.postId

      Comment.find({post: postId})
        .sort({dateCreated: -1})
        .populate('author', '_id username')
        .then(comments => {
          res.status(200).send(comments)
        })
    },
    post: (req, res) => {
      let postId = req.params.postId
      let commentData = {
        post: postId,
        content: req.body.content
      }

      Comment.create(commentData).then(comment => {
        res.status(200).send({comment})
      })
    }
  },
  get: (req, res) => {
    let commentId = req.params.id

    Comment
      .findById(commentId)
      .then((comment) => {
        if (comment === null) {
          res.status(400).send({message: 'Comment with this id not found.'})
          return
        }

        res.status(200).send(comment)
      })
  },
  edit: (req, res) => {
    let commentEditor = req.user._id
    let content = req.body.content
    let commentId = req.params.id

    User
      .findById(commentEditor)
      .then((user) => {
        Comment
          .findById(commentId)
          .then((comment) => {
            if (user.roles.indexOf('Admin') > -1) {
              comment.content = content
              comment.save().then(() => res.status(200).send(comment))
            } else if (user._id.toString() === comment.author.toString()) {
              comment.content = content
              comment.save().then(() => res.status(200).send(comment))
            } else {
              res.status(401).send({message: 'Cannot edit comment'})
            }
          })
      })
  },
  delete: (req, res) => {
    let commentEditor = req.user._id
    let commentId = req.params.id

    User
      .findById(commentEditor)
      .then((user) => {
        Comment
          .findById(commentId)
          .then((comment) => {
            if (user.roles.indexOf('Admin') > -1) {
              comment.remove().then(() => res.status(200).send(comment))
            } else if (user._id.toString() === comment.author.toString()) {
              comment.remove().then(() => res.status(200).send(comment))
            } else {
              res.status(401).send({message: 'Cannot delete comment'})
            }
          })
      })
  }
}