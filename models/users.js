var mongoose = require("mongoose");
var crypto = require("crypto");

var userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  hash: String,
  salt: String,
  image: { type: String, required: true },
  uploadedImages: { type: Array },
  tasks: { type: Array }
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha1")
    .toString("hex");
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha1")
    .toString("hex");
  console.log("validPassword method executed");

  return hash === this._doc.hash;
};

module.exports = mongoose.model("User", userSchema);
