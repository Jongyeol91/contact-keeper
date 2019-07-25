const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Contact = require('../models/Contact');
const { check, validationResult } = require('express-validator');

// @route   get api/contacts
// @desc    Get all user contact
// @access  Private
router.get("/", auth, async(req, res) => {
    try {
        const contacts = await Contact.find({user: req.user.id}).sort({date: -1});
        res.json(contacts);
    } catch(err) {
        console.error(err);
    }
    res.send("Get all user contact")
});


// @route   PUT api/contacts/
// @desc    add new contact
// @access  Private
router.post("/", [auth, [
    check('name', 'Name is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const {name, email, phone, type} = req.body;

    try {
        const newContact = new Contact({
            name,
            email,
            phone,
            type,
            user: req.user.id
        });
        const contact = await newContact.save();
        res.json(contact);
    } catch(err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

// @route   PUT api/contacts/:id
// @desc    update contact
// @access  Private
router.put('/:id', auth, async(req, res) => { // 파라미터의 id는 contact자체 id를 뜻함
    const { name, email, phone, type } = req.body;
    const contactFields = {};
    if (name) contactFields.name = name;
    if (email) contactFields.email = email;
    if (phone) contactFields.phone = phone;
    if (type) contactFields.type = type;
    
    try {
        let contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({msg: 'contact not found'});
        if (contact.user.toString() !== req.user.id) { // contact.user은 주인 user id, req.user.id는 토큰 payload에 넣어준 id
            return res.status(401).json({msg: 'not authorized'});

        }
        contact = await Contact.findByIdAndUpdate(req.params.id,
            { $set: contactFields },
            { new: true });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/contacts/:id
// @desc    add new contact
// @access  Private
router.delete("/:id", auth, async(req, res) => {
    try {
        // 못찾았을 경우
        let contact = await Contact.findById(req.params.id);
        if(!contact) return res.status(401).send({msg: "삭제할 연락처를 찾지 못했습니다."});
        
        // 권한 확인
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({msg: "삭제 권한이 없습니다."});
        }
        
        // 삭제 실행
        await Contact.findByIdAndRemove(req.params.id);
        res.json({msg: "삭제 성공"});

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

