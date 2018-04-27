const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");
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

/**
 * @route       POST api/profiles/experience
 * @description Add experience to profile
 * @access      Private
 */
router.post("/experience", passport.authenticate("jwt", { session: false }), (request, response) => {
  const { errors, isValid } = validateExperienceInput(request.body);
  if (!isValid) {
    return response.status(400).json(errors);
  }

  Profile.findOne({ user: request.user.id })
    .then(profile => {
      if (!profile) {
        errors.noProfile = "User has no profile";
        return response.status(404).json(errors);
      }
      const newExp = {
        title: request.body.title,
        company: request.body.company,
        location: request.body.location,
        from: request.body.from,
        to: request.body.to,
        current: request.body.current,
        description: request.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);
      profile
        .save()
        .then(profile => response.json(profile))
        .catch(err => response.status(400).json(err));
    })
    .catch(err => {
      response.status(404).json(err);
    });
});

/**
 * @route       POST api/profiles/education
 * @description Add education to profile
 * @access      Private
 */
router.post("/education", passport.authenticate("jwt", { session: false }), (request, response) => {
  const { errors, isValid } = validateEducationInput(request.body);
  if (!isValid) {
    return response.status(400).json(errors);
  }

  Profile.findOne({ user: request.user.id })
    .then(profile => {
      if (!profile) {
        errors.noProfile = "User has no profile";
        return response.status(404).json(errors);
      }
      const newEdu = {
        school: request.body.school,
        degree: request.body.degree,
        fieldOfStudy: request.body.fieldOfStudy,
        from: request.body.from,
        to: request.body.to,
        current: request.body.current,
        description: request.body.description
      };

      // Add to Edu array
      profile.education.unshift(newEdu);
      profile.save().then(profile => response.json(profile));
    })
    .catch(err => {
      response.status(400).json(err);
    });
});

/**
 * @route       DELETE api/profiles/experience/:exp_id
 * @description Delete experience from profile
 * @access      Private
 */
router.delete("/experience/:exp_id", passport.authenticate("jwt", { session: false }), (request, response) => {
  Profile.findOne({ user: request.user.id })
    .then(profile => {
      if (!profile) {
        errors.noProfile = "User has no profile";
        return response.status(404).json(errors);
      }

      // Get remove index
      const removeIndex = profile.experience.map(item => item.id).indexOf(request.params.exp_id);
      // Splice out of array
      profile.experience.splice(removeIndex, 1);
      profile.save().then(profile => response.json(profile));
    })
    .catch(err => {
      response.status(404).json(err);
    });
});

/**
 * @route       DELETE api/profiles/education/:edu_id
 * @description Delete experience from profile
 * @access      Private
 */
router.delete("/education/:edu_id", passport.authenticate("jwt", { session: false }), (request, response) => {
  Profile.findOne({ user: request.user.id })
    .then(profile => {
      if (!profile) {
        errors.noProfile = "User has no profile";
        return response.status(404).json(errors);
      }

      // Get remove index
      const removeIndex = profile.education.map(item => item.id).indexOf(request.params.exp_id);
      // Splice out of array
      profile.education.splice(removeIndex, 1);
      profile.save().then(profile => response.json(profile));
    })
    .catch(err => {
      response.status(404).json(err);
    });
});

/**
 * @route       DELETE api/profiles
 * @description Delete user and profile
 * @access      Private
 */
router.delete("/", passport.authenticate("jwt", { session: false }), (request, response) => {
  Profile.findOneAndRemove({ user: request.user.id })
    .then(() => {
      User.findOneAndRemove({ _id: request.user.id })
        .then(() => {
          response.json({ success: true });
        })
        .catch(err => {
          response.json({ success: false, error: err });
        });
    })
    .catch(err => {
      response.json({ success: false, error: err });
    });
});

module.exports = router;
