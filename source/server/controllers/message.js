const Message = require('../models/Message')
const Thread = require('../models/Thread')

module.exports = {
  addPost: (req, res) => {
    let content = req.body.content
    let threadId = req.params.threadId
    Message
      .create({
        content: content,
        author: req.user._id,
        authorUsername: req.user.username
      })
      .then((message) => {
        Thread
          .findByIdAndUpdate(threadId, { $push: { 'messages': message._id } }, {new: true})
          .populate('messages')
          .then((thread) => {
            res.status(200).send(thread)
          })
      })
      .catch(err => {
        let message = err.message
        res.send(message)
      })
  }
}
