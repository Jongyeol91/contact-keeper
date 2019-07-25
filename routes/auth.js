const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get("/", auth, async (req, res) => {
    
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
    
    res.send("get logged in user");

});

// @route   POST api/auth
// @desc    Auth user & get Token
// @access  Public 
router.post("/",[
    check('email', '이메일 형식을 입력하세요').isEmail(),
    check('password', '패스워드를 입력하세요').exists() // exists괄호 안에 커스텀 가능
    ], async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({email});
            if(!user) {
                return res.status(400).json({msg: '잘못된 정보입니다.'});
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({msg: '잘못된 정보'});
            } 

            const payload = {
                user: {
                    id: user.id // 유저 아이디를 권한 인증 및 접근 가능
                }
            };
            
            // 로그인 성공시 토큰 발행
            jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });

        } catch (err) {
            console.error(err);
            res.status(500).send('server err');
        }

});

module.exports = router