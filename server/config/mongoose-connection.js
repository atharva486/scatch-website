const mongoose=require('mongoose');
require('dotenv').config();

const dbgr = require("debug")("prod:mongoose");

mongoose.connect(process.env.MONGODB_URI)
.then(() => dbgr("MongoDB connected"))
.catch((err) => dbgr(" Connection error:", err));

module.exports = mongoose.connection;