const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (request, response) => {
  response.json({ msg: 'Users works' });
});

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', (request, response) => {
  User.findOne({ email: request.body.email })
    .then(user => {
      if (user) {
        return response.status(400).json({ email: 'Email already exists' });
      } else {
        const avatar = gravatar.url(request.body.email, {
          s: '200',
          r: 'pg',
          d: 'mm'
        });
        const newUser = new User({
          name: request.body.name,
          email: request.body.email,
          avatar: avatar,
          password: request.body.password
        });

        console.log(newUser);

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => response.json({user}))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;