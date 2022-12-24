var mongoose   = require("mongoose");

var contactSchema=new mongoose.Schema({
  name:String,
  phone:String,
  email:String,
  linkedIn:String,
  user:String
});

module.exports = mongoose.model("contact",contactSchema);