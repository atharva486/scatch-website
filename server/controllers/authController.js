const usermodel = require('../models/usermodel');
const ownermodel = require('../models/ownermodel');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {generateToken} = require('../utils/generateToken');
const {generatePassword} = require('../utils/generateUser');



module.exports.register_user = async (req,res)=>{
    try{
    let {fullname,email,password} = req.body;
    let user_find = await usermodel.findOne({email:email});
    if(!user_find){
    let pass = await generatePassword(password);
    let user = await usermodel.create({
        fullname,
        email,
        password:pass
    })
    res.json({success:true});
    }
    else
        res.json({success:false});
    }
    catch(err){
        
        res.json({success:false});
    }
};

module.exports.register_seller = async (req,res)=>{
    
    try{
    let {fullname,email,password,gstin} = req.body;
    let user_find = await ownermodel.findOne({email:email});
    if(!user_find){
    let pass = await generatePassword(password);
    let user = await ownermodel.create({
        fullname,
        email,
        password:pass,
        gstin:gstin,
    })
    res.json({success:true});
    }
    else
        res.json({success:false});
    }
    catch(err){

        res.json({success:false});
    }
}

module.exports.login_user = async (req,res)=>{
    try{
    let {email,password} = req.body;
    let user = await usermodel.findOne({email:email});
    if(!user)
        res.json({success:false,user:false});
    else{
        let result = await bcrypt.compare(password,user.password);
        if(result){
        let token = generateToken(user);
        res.cookie("token",token);
        res.json({success:true,user:true});
        }
        else    
            res.json({success:false,user:true});
        
    }}
    catch{
        res.json({success:false})
    }
    
};
module.exports.login_seller = async (req,res)=>{
    try{
    let {email,password} = req.body;
    let user = await ownermodel.findOne({email:email});
    if(!user)
        res.json({success:false,user:false});
    else{
        let result = await bcrypt.compare(password,user.password);
        if(result){
        let token = generateToken(user);
        res.cookie("token",token);
        res.json({success:true,user:true});
        }
        else    
        res.json({success:false,user:true});
        
    }}
    catch{
        res.json({success:false})
    }
};

module.exports.logout = async (req,res,next)=>{
    try{
    res.cookie("token","");
    res.json({success:true})
    }
    catch{
        res.json({success:false});
    }
}