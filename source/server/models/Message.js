const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required'
const maxlength = [1000, 'The message content exceeds the maximum allowed length of {MAXLENGTH} characters.']

let messageSchema = new mongoose.Schema({
  content: { type: String, required: REQUIRED_VALIDATION_MESSAGE, maxlength: maxlength },
  author: { type: ObjectId, required: REQUIRED_VALIDATION_MESSAGE, ref: 'User' },
  authorUsername: { type: String },
  creationDate: { type: Date, default: Date.now }
})

let Message = mongoose.model('Message', messageSchema)

module.exports = Message
