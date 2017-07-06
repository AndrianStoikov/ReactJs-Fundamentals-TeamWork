const mongoose = require('mongoose')

let commentSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: mongoose.Schema.Types.String, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  dateCreated: { type: mongoose.Schema.Types.Date, default: Date.now }
})

let Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
