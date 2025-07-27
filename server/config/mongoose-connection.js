const mongoose=require('mongoose');
const config = require('config');
const ObjectId = mongoose.Types.ObjectId;
const dbgr = require("debug")("development:mongoose");
mongoose
.connect(`${config.get("MONGODB_URI")}/scatch`)
.then(function(){
    dbgr("connected");
})
.catch(function(){
    dbgr(" disconnected");
})

module.exports = mongoose.connection;