const httpStatusCode = require('../utils/httpStatusCode');

const AdminAuthCheck = (req,res,next)=>{

    try{
        console.log(req.user.role,"admin role")
        if(req?.user && req?.user?.role === 'admin'){
            return next();
        }

        return res.status(httpStatusCode.FORBIDDEN).json({
            success:false,
            message:"You are not authorized to access this resource"
      });

    }catch(err){
        console.log("AdminAuthCheck error",err)
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}
module.exports = AdminAuthCheck;