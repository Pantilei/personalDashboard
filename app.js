require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const fileUpload = require("express-fileupload");

var mongoose = require("mongoose");

var config = require("./config");

var indexRouter = require("./routes/index");

//>
mongoose.connect(process.env.MONGODB_URI || config.dbConfString, {
  useMongoClient: true
});
global.User = require("./models/users");
//>
var app = express();
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//================>
app.use(express.static(path.join(__dirname, "client/build")));
//CHEK THIS CODE, IT CAUSES ERROR ON RELOAD OF PAGE//Solved by putting to end of file
/* if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendfile(path.join((__dirname = "client/build/index.html")));
  });
}
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/public/index.html"));
}); */
/* app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
}); */
//=================>
app.use(fileUpload());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//<
app.use(cookieParser());

app.use(cors());

//>
//app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
/* app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
}); */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendfile(path.join((__dirname = "client/build/index.html")));
  });
}
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/public/index.html"));
});

module.exports = app;
