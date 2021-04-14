'use strict';

const express = require("express");
const firebase = require("firebase");
const firebaseAdmin = require("firebase-admin");

const router = express.Router();
const jsonParser = require("body-parser").json;
const auth = require("./auth");
const firebaseConfig = require("./firebase-setup");
const maxRecipies = 6;


const corsOptions= {
  origin: "http://localhost:8080"
};

firebase.initializeApp(firebaseConfig);
//Database references
const rootRef = firebase.database().ref();
const recipiesRef = rootRef.child('recipies');  //recipies
const usersRef = rootRef.child('users'); //stored user data
const menuesRef = rootRef.child('week_menues'); //stored menues

function getUserWeekMenues(key, cb) {
  menuesRef.child(key).on('child_added', snap => {
    let usersRef = usersRef.child(snap.key);
    usersRef.once('value', cb);
  });
}


//Login user
//Return Logged in user data

router.post("/user/loginuser", function(req, res){
  var username = req.query.username;
  var password = req.query.password;
  console.log('*************username ',username, ' password ', password);
  var response = {};
  firebase.auth().signInWithEmailAndPassword(username, password)
  .then(function(user){
    if (user) {
      response = {
        resp: "xmlresp",
        user: user
      };
        res.json(response);
      }
  })
  .catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log('error ', errorMessage);
  response = {
    resp: "error",
    code: errorCode,
    user: errorMessage
  };
    res.json(response);
});
});

//GetUserdata
//Return Logged in user data

router.post("/user/data", auth.isAuthenticated,function(req, res){
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
    // ...
  });
  res.json({
    response: "You sent me a post request",
    body: req.body
  });
});


//Post /isloggedin
//Route for creation questions
router.post("/user/isloggedin", auth.isAuthenticated,function(req, res){

  res.json({
    response: "You sent me a  post request to islogged in " + req.user,
    body: req.body
  });
});

//Post /savenewuserinfo/:id
//Route for saving a new userobject in database
router.post("savenewuserinfo/", auth.isAuthenticated,function(req, res){
  var user = req.user;
  var username = req.params.uname;
  var email = req.params.email;
  var imageUrl = req.params.imageUrl;

  firebase.database().ref('users/' + user.uid).set({
    username: username,
    email: email,
    profile_picture : imageUrl
  });

  res.json({
    response:"You sent me a Get request for ID by" + req.params.id
  });
});

router.post("updateuserinfo/", auth.isAuthenticated,function(req, res){
    // A post entry.
    var username = req.user.username;
    var uid = req.user.uid;

    var postData = {
      author: username,
      uid: uid,
      body: body,
      title: title,
      authorPic: picture
    };

    // Get a key for a new user.
    var newPostKey = firebase.database().ref().child('users').push().key;

    // Update the user info in database
    var updates = {};
    updates['/users/' + newPostKey] = postData;
    res.json({
      updated: firebase.database().ref().update(updates)
    });
});

//Put user data
//
module.exports = router;
