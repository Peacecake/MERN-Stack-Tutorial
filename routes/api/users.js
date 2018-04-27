const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

const User = require("../../models/User");

/**
 * @route GET api/users/test
 * @description Tests users route
 * @access  Public
 */
router.get("/test", (request, response) => {
  response.json({ msg: "Users works" });
});

/**
 * @route   POST api/users/register
 * @description Register a user
 * @access  Public
 */
router.post("/register", (request, response) => {
  User.findOne({ email: request.body.email })
    .then(user => {
      if (user) {
        return response.status(400).json({ email: "Email already exists" });
      } else {
        const avatar = gravatar.url(request.body.email, {
          s: "200",
          r: "pg",
          d: "mm"
        });
        const newUser = new User({
          name: request.body.name,
          email: request.body.email,
          avatar: avatar,
          password: request.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => response.json({ user }))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

/**
 * @route       POST api/users/login
 * @description Login user, Returning JWT Token
 * @access      Public
 */
router.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  // Find user by email
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return response.status(404).json({ email: "User not found" });
      }

      // Check Password
      bcrypt
        .compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // User Matched
            const payload = {
              id: user._id,
              name: user.name,
              avatar: user.avatar
            };

            // Sign Token
            jwt.sign(
              payload,
              keys.secretOrKey,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) {
                  return response
                    .status(400)
                    .json({ password: "Error during signing token" });
                }
                response.json({ success: true, token: "Bearer " + token });
              }
            );
          } else {
            return response
              .status(400)
              .json({ password: "Password incorrect" });
          }
        })
        .catch(err => {
          return response
            .status(400)
            .json({ password: "Error while comparing ", error: err });
        });
    })
    .catch(err => {
      return response
        .status(404)
        .json({ email: "Error while retrieving user data", error: err });
    });
});

/**
 * @route       GET api/users/current
 * @description returns current user
 * @access      Private
 */
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    response.json({
      id: request.user.id,
      name: request.user.name,
      email: request.user.email
    });
  }
);

module.exports = router;
