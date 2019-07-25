const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    //Get token from header
    const token = req.header('x-auth-token');

    //Check if not token
    if (!token) {
        return res.status(401).json({msg: "토큰이 없습니다. 인증이 거부되었습니다."});
    }
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user; //페이로드의 user정보를 req.user에 담는다.
        next();
    } catch(err) {
        res.status(401).json({msg: 'token is not valid'});
    }
}