const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

const validatePostInput = require("../../validation/post");

/**
 * @route       GET api/posts
 * @description Get posts
 * @access      Public
 */
router.get("/", (request, response) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      if (!posts) {
        return response.status(404).json({ noPost: "Posts not found" });
      }
      response.json(posts);
    })
    .catch(err => response.status(404).json(err));
});

/**
 * @route       GET api/posts/:id
 * @description Get post by id
 * @access      Public
 */
router.get("/:id", (request, response) => {
  Post.findById(request.params.id)
    .then(post => {
      if (!post) {
        return response.status(404).json({ noPost: "Post not found" });
      }
      response.json(post);
    })
    .catch(err => response.status(404).json(err));
});

/**
 * @route       POST api/posts
 * @description Create a post
 * @access      Private
 */
router.post("/", passport.authenticate("jwt", { session: false }), (request, response) => {
  const { errors, isValid } = validatePostInput(request.body);
  if (!isValid) {
    return response.status(400).json(errors);
  }

  const newPost = new Post({
    text: request.body.text,
    name: request.body.name,
    avatar: request.body.avatar,
    user: request.user.id
  });
  newPost.save().then(post => response.json(post));
});

/**
 * @route       DELETE api/posts/:id
 * @description Delete a post
 * @access      Private
 */
router.delete("/:id", passport.authenticate("jwt", { session: false }), (request, response) => {
  Profile.findOne({ user: request.user.id })
    .then(profile => {
      Post.findById(request.params.id)
        .then(post => {
          if (!post) {
            return response.status(404).json({ noPost: "Post not found" });
          }
          if (post.user.toString() !== request.user.id) {
            return response.status(401).json({ notAuthorized: "User not authorized" });
          }

          post
            .remove()
            .then(() => response.json({ success: true }))
            .catch(err => response.status(400).json(err));
        })
        .catch(err => response.status(404).json({ noPost: "Post not found" }));
    })
    .catch(err => response.status(404).json({ noProfile: "User has no profile" }));
});

module.exports = router;
