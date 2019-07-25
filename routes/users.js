const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// @route   POST api/users
// @desc    유저등록
// @access  Public
router.post("/", [
        check('name', "이름을 필수값 입니다.").not().isEmpty(),
        check("email", "올바른 이메일 형식을 입력하세요").isEmail(),
        check("password", "6자리 이상 문자를 입력하세요").isLength({min: 6})
    ], async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log("req.body", req.body);

    const { name, email, password } = req.body;
    
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({msg: '유저가 이미 존재합니다.'});
        }

        user = new User({ //모델 생성자
            name,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: {
                id: user.id // 유저 아이디를 권한 인증 및 접근 가능
            }
        };

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err;
            res.json({token})
        });
    } catch(err) {
        console.log(err);
        res.status(500).send('server err')
    }

});

module.exports = router;