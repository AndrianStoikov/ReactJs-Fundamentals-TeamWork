const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required'

let threadSchema = new mongoose.Schema({
  users: [{ type: String, required: REQUIRED_VALIDATION_MESSAGE }],
  userIds: [{ type: ObjectId, ref: 'User' }],
  creationDate: { type: Date, default: Date.now },
  messages: [{ type: ObjectId, ref: 'Message' }]
})

let Thread = mongoose.model('Thread', threadSchema)

module.exports = Thread
