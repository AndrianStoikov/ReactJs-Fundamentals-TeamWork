let mongoose = require('mongoose')

let postSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: mongoose.Schema.Types.String },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dateCreated: { type: mongoose.Schema.Types.Date, default: Date.now }
})

let indexFields = {
  content: 'text',
  comments: 'text'
}

postSchema.index(indexFields)

let Post = mongoose.model('Post', postSchema)

module.exports = Post
