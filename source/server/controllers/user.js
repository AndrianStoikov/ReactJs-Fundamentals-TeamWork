const User = require('../models/User')
const encryption = require('../utilities/encryption')
const jwt = require('jsonwebtoken')

module.exports = {
  register: {
    post: (req, res) => {
      let userData = req.body

      if (userData.password && userData.password !== userData.confirmedPassword) {
        return res.status(400).send({message: 'Passwords do not match'})
      }

      let salt = encryption.generateSalt()
      userData.salt = salt

      if (userData.password) {
        userData.password = encryption.generateHashedPassword(salt, userData.password)
      }

      User.create(userData)
        .then(user => {
          req.logIn(user, (err) => {
            if (err) {
              return res.status(200).send({message: 'Wrong credentials!'})
            }

            const payload = {
              exp: Math.floor(Date.now() / 1000) + (60 * 60),
              sub: req.user._id
            }

            // create a token string
            const token = jwt.sign(payload, 's0m3 r4nd0m str1ng')
            let responseData = {
              token: token,
              user: req.user
            }

            res.status(200).send(responseData)
          })
        })
        .catch(error => {
          res.status(500).send({message: error})
        })
    }
  },
  login: {
    post: (req, res) => {
      let userData = req.body

      User.findOne({username: userData.username}).then(user => {
        if (!user || !user.authenticate(userData.password)) {
          return res.status(401).send({message: 'Wrong credentials!'})
        }

        req.logIn(user, (err, user) => {
          if (err) {
            return res.status(401).send({message: err})
          }

          const payload = {
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            sub: req.user._id
          }

          // create a token string
          const token = jwt.sign(payload, 's0m3 r4nd0m str1ng')

          let userObj = req.user
          delete userObj.password
          delete userObj.salt
          let responseData = {
            token: token,
            user: userObj
          }

          res.status(200).send(responseData)
        })
      })
    }
  },
  profile: {
    get: (req, res) => {
      let userId = req.params.userId

      User.findById(userId).then(user => {
        if (!user) { return res.status(404).send({message: 'User no longer exists'}) }

        let userObj = {
          username: user.username,
          age: user.age,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender
        }

        res.status(200).send(userObj)
      })
    }
  },
  logout: (req, res) => {
    req.logout()
    res.status(200).end()
  },
  get: (req, res) => {
    let userId = req.params.userId

    User.findById(userId).then(user => {
      if (!user) { return res.status(404).send({message: 'User no longer exists'}) }

      let userObj = {
        username: user.username,
        age: user.age,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender
      }

      res.status(200).send(userObj)
    })
  },
  findUserByUsername: {
    get: (req, res) => {
      let username = req.params.username

      User.find({username: username}).then(user => {
        if (!user) {
          return res.status(404).send({message: 'User no longer exists'})
        }

        res.status(200).send(user)
      })
    }
  },
  blockUser: (req, res) => {
    let currentUserId = req.body.currentUserId
    let userForBlockId = req.body.userForBlockId

    User.findById(currentUserId).then(user => {
      if (!user.blockedUsersId.map((id) => id.toString()).includes(userForBlockId)) {
        user.blockedUsersId.push(userForBlockId)
        user.save()
        res.status(200).send()
      } else {
        res.status(404).send()
      }
    })
  },
  makeAdmin: (req, res) => {
    if (req.user.roles.indexOf('Admin') >= 0) {
      let userForAdmin = req.body.userForAdmin
      User.findOne({username: userForAdmin}).then(user => {
        if (!user) {
          return res.status(404).send({message: 'No such user exists'})
        } else {
          user.roles.push('Admin')
          user.save()
          res.status(200).send()
        }
      })
    } else {
      res.status(401).send()
    }
  },
  getAdmins: (req, res) => {
    if (req.user.roles.indexOf('Admin') >= 0) {
      User.find({roles: 'Admin'}).then(users => {
        if (!users) {
          return res.status(404).send({message: 'No admins found'})
        }
        res.status(200).send(users)
      })
    } else {
      res.status(401).send()
    }
  }
}
