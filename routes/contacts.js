const express = require('express');
const router = express.Router();

// @route   POST api/contacts
// @desc    Get all user contact
// @access  Private
router.post("/", (req, res) => {
    res.send("Get all user contact")
});

// @route   PUT api/contacts/:id
// @desc    add new contact
// @access  Private
router.put("/:id", (req, res) => {
    res.send("update contact")
});

// @route   DELETE api/contacts/:id
// @desc    add new contact
// @access  Private
router.delete("/:id", (req, res) => {
    res.send("Delete Contact")
});

module.exports = router