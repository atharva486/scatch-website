
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const userModel = require('../models/usermodel');
const ownerModel = require('../models/ownermodel');


module.exports.authMiddlewareUser = async (req,res,next)=>{

    let {email,id} = jwt.verify(req.cookies.token,process.env.JWT_KEY);
    let user = await userModel.findOne({_id:id});
    if(user)
        req.access=true;
    else
        req.access=false;
    next();
}
module.exports.authMiddlewareSeller = async (req,res,next)=>{
    let {email,id} = jwt.verify(req.cookies.token,process.env.JWT_KEY);
    let user = await ownerModel.findOne({_id:id});
    if(user)
        req.access=true;
    else
        req.access=false;
    next();
}
