var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");
const fs = require("fs");

const config = require("../config");
const authToken = require("../middleware/authToken");

router.route("/").get(authToken, function(req, res, next) {
  console.log("before verify");
  console.log(req.token);

  jwt.verify(req.token, config.sekretKey, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        userId: authData.userId,
        username: authData.username,
        token: req.token
      });
    }
  });
});

router.route("/signup").post(function(req, res, next) {
  console.log(req.body);
  User.find({ email: req.body.email }).then(user => {
    if (user.length >= 1) {
      return res.status(200).json({
        message: "Mail exists"
      });
    } else {
      const file = req.files.image;
      file.mv(`${__dirname}/../uploads/${req.body.username}` + ".jpg");
      fs.mkdirSync(`${__dirname}/../uploads/${req.body.username}`);

      var user = new User();
      user.name = req.body.username;
      user.email = req.body.email;
      user.image = `/uploads/${req.body.username}` + ".jpg";
      user.setPassword(req.body.password);

      //const token =
      jwt.sign(
        {
          userId: user._id,
          username: user.name
        },
        config.sekretKey,
        {
          expiresIn: "7d"
        },
        function(err, token) {
          user.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              res.status(200).json({
                userId: user._id,
                username: user.name,
                token: token
              });
            }
          });
        }
      );
    }
  });
});

router.route("/login").post(function(req, res, next) {
  console.log(req.body);
  User.find({ email: req.body.email }).then(user => {
    //console.log(user[0].validPassword(req.body.password));
    if (user.length < 1) {
      return res.status(200).json({
        message: "No User with this email."
      });
    } else {
      if (user[0].validPassword(req.body.password)) {
        console.log("I am here");
        //const token =
        jwt.sign(
          {
            userId: user[0]._doc._id,
            username: user[0]._doc.name
          },
          config.sekretKey,
          {
            expiresIn: "7d"
          },
          (err, token) => {
            console.log(token);
            return res.status(200).json({
              token: token,
              userId: user[0]._doc._id,
              username: user[0]._doc.name
            });
          }
        );
      } else {
        return res.status(200).json({
          message: "Wrong Password"
        });
      }
    }
  });
});

router.route("/photos").post(authToken, function(req, res, next) {
  jwt.verify(req.token, config.sekretKey, function(err, authData) {
    /* console.log(authData); */

    const file = req.files.image;
    file.mv(`${__dirname}/../uploads/${authData.username}/${file.name}`);

    User.update(
      { _id: authData.userId },
      {
        $push: {
          uploadedImages: `${authData.username}/${file.name}`
        }
      }
    ).then(result => {
      console.log("------------------------------");
      console.log(result);
      User.find({ _id: authData.userId }).then(user => {
        return res.status(200).json({
          userId: user[0]._doc._id,
          username: user[0]._doc.name,
          uploadedImages: user[0]._doc.uploadedImages
        });
      });
    });
  });
});

router.route("/photos").get(authToken, function(req, res, next) {
  console.log("========");
  jwt.verify(req.token, config.sekretKey, function(err, authData) {
    if (err) {
      return res.status(401).json({ error: "No user!!!" });
    }
    User.find({ _id: authData.userId }).then(user => {
      return res.json({
        userId: authData.userId,
        username: authData.username,
        uploadedImages: user[0]._doc.uploadedImages
      });
    });
  });
});

router.route("/tasks").post(authToken, function(req, res, next) {
  jwt.verify(req.token, config.sekretKey, function(err, authData) {
    if (err) {
      return res.status(401).json({ error: "No user!!! Go to login page!" });
    }
    User.update(
      { _id: authData.userId },
      {
        $set: {
          [`tasks.${req.body.taskId}`]: {
            task: req.body.task,
            status: req.body.status
          }
        }
      }
    ).then(result => {
      console.log(result);
      User.findOne({ _id: authData.userId }).then(user => {
        return res.json({ tasks: user.tasks });
      });
    });
  });
});
router.route("/tasks").get(authToken, function(req, res, next) {
  jwt.verify(req.token, config.sekretKey, function(err, authData) {
    if (err) {
      return res.status(401).json({ error: "No user!!! Go to login page!" });
    }
    User.findOne({ _id: authData.userId }).then(user => {
      return res.json({
        userId: authData.userId,
        username: authData.username,
        tasks: user.tasks
      });
    });
  });
});

module.exports = router;
