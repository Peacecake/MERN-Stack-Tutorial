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

/**
 * @route       POST api/posts/like/:id
 * @description Like a Post
 * @access      Private
 */
router.post("/like/:id", passport.authenticate("jwt", { session: false }), (request, response) => {
  Profile.findOne({ user: request.user.id })
    .then(profile => {
      Post.findById(request.params.id)
        .then(post => {
          if (!post) {
            return response.status(404).json({ noPost: "Post not found" });
          }

          if (post.likes.filter(like => like.user.toString() === request.user.id).length > 0) {
            return response.status(400).json({ alreadyLiked: "User already liked this post" });
          }

          // Add user id to likes array
          post.likes.unshift({ user: request.user.id });
          post
            .save()
            .then(post => response.json(post))
            .catch(err => response.status(400).json(err));
        })
        .catch(err => response.status(404).json({ noPost: "Post not found" }));
    })
    .catch(err => response.status(404).json({ noProfile: "User has no profile" }));
});

/**
 * @route       POST api/posts/unlike/:id
 * @description unlike a Post
 * @access      Private
 */
router.post("/unlike/:id", passport.authenticate("jwt", { session: false }), (request, response) => {
  Profile.findOne({ user: request.user.id })
    .then(profile => {
      Post.findById(request.params.id)
        .then(post => {
          if (!post) {
            return response.status(404).json({ noPost: "Post not found" });
          }

          if (post.likes.filter(like => like.user.toString() === request.user.id).length === 0) {
            return response.status(400).json({ notLiked: "You have not yet liked this post" });
          }

          // Get remove index
          const removeIndex = post.likes.map(item => item.user.toString()).indexOf(request.user.id);
          // Splice out of array
          post.likes.splice(removeIndex, 1);
          post
            .save()
            .then(post => response.json(post))
            .catch(err => response.status(400).json(err));
        })
        .catch(err => response.status(404).json({ noPost: "Post not found" }));
    })
    .catch(err => response.status(404).json({ noProfile: "User has no profile" }));
});

/**
 * @route       POST api/posts/comment/:id
 * @description Add comment to post
 * @access      Private
 */
router.post("/comment/:id", passport.authenticate("jwt", { session: false }), (request, response) => {
  const { errors, isValid } = validatePostInput(request.body);
  if (!isValid) {
    return response.status(400).json(errors);
  }

  Post.findById(request.params.id)
    .then(post => {
      const newComment = {
        text: request.body.text,
        name: request.body.name,
        avatar: request.body.avatar,
        user: request.user.id
      };

      post.comments.unshift(newComment);
      post
        .save()
        .then(post => response.json(post))
        .catch(err => response.status(400).json(err));
    })
    .catch(err => {
      response.status(404).json({ postNotFound: "Post not found" });
    });
});

/**
 * @route       DELETE api/posts/comment/:id/:comment_id
 * @description Remove a comment from post
 * @access      Private
 */
router.delete("/comment/:id/:comment_id", passport.authenticate("jwt", { session: false }), (request, response) => {
  Post.findById(request.params.id)
    .then(post => {
      // Check if comment exists
      if (post.comments.filter(comment => comment._id.toString() === request.params.comment_id).length === 0) {
        return response.status(404).json({ commentNotFound: "Comment not found" });
      }

      const removeIndex = post.comments.map(item => item._id.toString()).indexOf(request.params.comment_id);
      post.comments.splice(removeIndex, 1);
      post
        .save()
        .then(post => response.json(post))
        .catch(err => response.status(400).json(err));
    })
    .catch(err => {
      response.status(404).json({ postNotFound: "Post not found" });
    });
});

module.exports = router;
