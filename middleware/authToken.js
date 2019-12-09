const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = (req, res, next) => {
  //console.log("I am in try!");
  const token = req.headers.authorization.split(" ")[1];
  req.token = token;
  //console.log(req.token);
  next();
};
