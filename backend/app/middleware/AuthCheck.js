const jwt = require('jsonwebtoken');
const httpStatusCode = require('../utils/httpStatusCode');

const AuthCheck = (req, res, next) => {

    let token = req?.body?.token || req?.query?.token || req?.headers?.['x-access-token'] || req?.headers?.[`authorization`];

    if (!token) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
            success: false,
            message: "Token is required for access this url"
        })
    }
    if (token.startsWith('Bearer')) {
        token = token.split(' ')[1];
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(req?.anshu,'reqUser');
    }
    catch (err) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
            success: false,
            message: "Invalid or expired token"
        })
    }
    return next();

}
module.exports = AuthCheck;