const express = require('express');
const router = express.Router();

// @route   GET api/profiles/test
// @desc    Tests profiles route
// @access  Public
router.get('/test', (request, response) => {
  response.json({ msg: 'Profiles works' });
});

module.exports = router;