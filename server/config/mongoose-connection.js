const mongoose=require('mongoose');
require('dotenv').config(); 
const config = require('config');
const ObjectId = mongoose.Types.ObjectId;
const dbgr = require("debug")("development:mongoose");
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB connection error:", err));


module.exports = mongoose.connection;