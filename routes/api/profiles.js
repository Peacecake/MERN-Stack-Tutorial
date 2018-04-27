const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

const validateProfileInput = require("../../validation/profile");

/**
 * @route       GET api/profiles/test
 * @description Tests profiles route
 * @access      Public
 */
router.get("/test", (request, response) => {
  response.json({ msg: "Profiles works" });
});

/**
 * @route       GET api/profiles
 * @description Get current users profile
 * @access      Private
 */
router.get("/", passport.authenticate("jwt", { session: false }), (request, response) => {
  const errors = {};
  Profile.findOne({ user: request.user.id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no profile for this user";
        return response.status(404).json(errors);
      }
      response.json(profile);
    })
    .catch(err => {
      response.status(404).json(err);
    });
});

/**
 * @route       GET api/profiles/all
 * @description Get all profiles
 * @access      Public
 */
router.get("/all", (request, response) => {
  const errors = {};
  Profile.find({})
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noProfiles = "There are no profiles";
        return response.status(404).json(errors);
      }
      response.json(profiles);
    })
    .catch(err => {
      errors.noProfiles = "There are no profiles";
      return response.status(404).json(errors);
    });
});

/**
 * @route       GET api/profiles/handle/:handle
 * @description Get profile by handle
 * @access      Public
 */
router.get("/handle/:handle", (request, response) => {
  const errors = {};
  Profile.findOne({ handle: request.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no profile for this user";
        response.status(404).json(errors);
      }
      response.json(profile);
    })
    .catch(err => response.status(404).json(err));
});

/**
 * @route       GET api/profiles/user/:user_id
 * @description Get profile by user id
 * @access      Public
 */
router.get("/user/:user_id", (request, response) => {
  const errors = {};
  Profile.findOne({ user: request.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no profile for this user";
        response.status(404).json(errors);
      }
      response.json(profile);
    })
    .catch(err => response.status(404).json({ profile: "There is no profile for this user" }));
});

/**
 * @route       POST api/profiles
 * @description Create or edit user profile
 * @access      Private
 */
router.post("/", passport.authenticate("jwt", { session: false }), (request, response) => {
  const { errors, isValid } = validateProfileInput(request.body);
  if (!isValid) {
    return response.status(400).json(errors);
  }

  // Get fields
  const profileFields = {};
  profileFields.user = request.user.id;
  if (request.body.handle) profileFields.handle = request.body.handle;
  if (request.body.company) profileFields.company = request.body.company;
  if (request.body.website) profileFields.website = request.body.website;
  if (request.body.location) profileFields.location = request.body.location;
  if (request.body.bio) profileFields.bio = request.body.bio;
  if (request.body.status) profileFields.status = request.body.status;
  if (request.body.githubUsername) profileFields.githubUsername = request.body.githubUsername;
  // Skills - split into array
  if (typeof request.body.skills !== "undefined") {
    profileFields.skills = request.body.skills.split(",");
  }
  // Social
  profileFields.social = {};
  if (request.body.youtube) profileFields.social.youtube = request.body.youtube;
  if (request.body.twitter) profileFields.social.twitter = request.body.twitter;
  if (request.body.facebook) profileFields.social.facebook = request.body.facebook;
  if (request.body.linkedin) profileFields.social.linkedin = request.body.linkedin;
  if (request.body.instagram) profileFields.social.instagram = request.body.instagram;

  Profile.findOne({ user: request.user.id }).then(profile => {
    if (profile) {
      // Update
      Profile.findOneAndUpdate({ user: request.user.id }, { $set: profileFields }, { new: true })
        .then(profile => response.json(profile))
        .catch(err => response.status(400).json(err));
    } else {
      // Create

      // Check if handle exists
      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = "That handle already exits";
          response.status(400).json(errors);
        }

        // Save Profile
        new Profile(profileFields)
          .save()
          .then(profile => response.json(profile))
          .catch(err => response.status(400).json(err));
      });
    }
  });
});

module.exports = router;
