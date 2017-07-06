const Comment = require('../models/Comment')

module.exports = {
  getPostComments: {
    get: (req, res) => {
      let postId = req.params.postId

      Comment.find({ post: postId })
        .sort({ dateCreated: -1 })
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
        res.status(200).send({ comment })
      })
    }
  }
}
