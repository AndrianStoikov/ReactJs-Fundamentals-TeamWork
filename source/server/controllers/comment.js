const Comment = require('../models/Comment')

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
    let content = req.body
    let commentId = req.params.id

    Comment
      .findByIdAndUpdate(commentId, {content: content.content})
      .then((comment) => {
        res.status(200).send(comment)
      })
  },
  delete: (req, res) => {
    let commentId = req.params.id

    Comment
      .findByIdAndRemove(commentId)
      .then(() => {
        res.status(200).end()
      })
  }
}