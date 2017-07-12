const Thread = require('../models/Thread')
const User = require('../models/User')

module.exports = {
  getUserThreads: (req, res) => {
    if (req.user) {
      let currUser = req.user.username
      Thread
        .find({users: {$in: [currUser]}})
        .sort('-creationDate')
        .then((currUsersThreads) => {
          for (let thread of currUsersThreads) {
            if (thread.users[0] === currUser) {
              thread.otherUser = thread.users[1]
              thread.otherUserBlocked = false
              if (req.user.blockedUsersId.indexOf(thread.users[1]) >= 0) {
                thread.otherUserBlocked = true
              }
            } else {
              thread.otherUser = thread.users[0]
              thread.otherUserBlocked = false
              if (req.user.blockedUsersId.indexOf(thread.users[0]) >= 0) {
                thread.otherUserBlocked = true
              }
            }
          }
          res.status(200).send(currUsersThreads)
        })
    } else {
      res.status(404).send('Not Found')
    }
  },
  getThreadMessages: (req, res) => {
    let currUser = req.user.username
    let otherUser = req.params.username
    if (currUser === otherUser) {
      return res.status(404).send({message: 'Can not send message to yourself'})
    }
    User
      .findOne({username: otherUser})
      .then((userFound) => {
        if (!userFound) {
          return res.status(404).send({message: 'No such user exists'})
        }
        if (userFound.blockedUsersId.indexOf(req.user._id) >= 0) {
          res.locals.blocked = true
        }
        Thread
          .findOne({users: { $all: [currUser, otherUser] }})
          .populate('messages')
          .then((thread) => {
            if (!thread) {
              Thread
                .create({
                  users: [currUser, otherUser],
                  userIds: [req.user._id, userFound._id],
                  messages: []
                })
                .then((thread) => {
                  res.status(200).send(thread)
                })
            } else {
              res.status(200).send(thread)
            }
          })
      })
  }
}
