'use strict';

const express = require("express");
const firebase = require("firebase");

const router = express.Router();
const jsonParser = require("body-parser").json;
const auth = require("./auth");
const firebaseConfig = require("./firebase-setup");
const maxRecipes = 8;
var firebaseAdmin = require("firebase-admin");

var serviceAccount = require("../weggo-application-firebase-adminsdk-owek6-ac94c7507d.json");
var adminConfig = {
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://weggo-application.firebaseio.com"
};
var adminApp = firebaseAdmin.initializeApp(adminConfig,'serviceAdminAppMain');
var adminAuth = adminApp.auth();
var adminDB = adminApp.database();

const corsOptions= {
  origin: "http://localhost:8080"
};

firebase.initializeApp(firebaseConfig);
//Database references
const rootRef = adminDB.ref();
const recipesRef = rootRef.child('recipies');  //recipes
const usersRef = rootRef.child('users'); //stored user data
const menuesRef = rootRef.child('week_menues'); //stored menues

function getUserWeekMenues(key, cb) {
  menuesRef.child(key).on('child_added', snap => {
    let usersRef = usersRef.child(snap.key);
    usersRef.once('value', cb);
  });
}
//Get /recipes
//return recipes collection
router.get("/recipes", function(req, res){
  var response = {};
  recipesRef.limitToLast(maxRecipes).once('value')
  .then(function(snapshot){
    if(snapshot.val() === null){
      console.log("error in snapshot");
    }
    else{
      console.log("********Getting you Recipes no number**************");
      res.json(snapshot.val());
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
//Get /Recipes/:resno
//
//return recipes collection according to resno amount of recipes
router.get("/recipes/:resno", function(req, res){
  console.log("********Getting you recipes with number **************");
//var numberofrec = parseInt(req.params.resno);
var response = {};
var numberofrec = req.params.resno;
  console.log("nfrec: " +numberofrec+ " maxr " + maxRecipes);
  recipesRef.orderByKey().startAt("recipe" +(numberofrec+maxRecipes)).limitToFirst(maxRecipes).once('value')
  .then(function(snapshot){
    if(snapshot.val() === null){
      console.log("error in snapshot");
    }
    else{
      console.log("********Getting you recipes with numbers  **************");

      res.json(snapshot.val());
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

//Get /Recipes/:resid
//
//return the recipe with id resid
router.get("/recipe/:resid", function(req, res){
  console.log("********Getting you recipes with id **************");
//var numberofrec = parseInt(req.params.resno);
var response = {};
var recipeId = req.params.resid;
  console.log("recipeID: " + recipeId);
  recipesRef.child('/recipe' +recipeId).once('value')
  .then(function(snapshot){
    if(snapshot.val() === null){
      console.log("error in snapshot");
    }
    else{
      console.log("********Getting you recipes with numbers  **************");
      res.json(snapshot.val());
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

//Create account
//Return success with new userid or error

router.post("/user/createaccount", function(req, res){
  var username = req.query.username;
  var password = req.query.password;
  console.log('*******Login******username ',username, ' password ', password);
  var response = {};
  //CReate account
  adminAuth.createUser({
    email: username,
    emailVerified: false,
    password: password,
    disabled: false
  })
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
      res.json(userRecord);
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
    });
});


//Login user
//Return Logged in user data

router.post("/user/loginuser", function(req, res){
  var username = req.query.username;
  var password = req.query.password;
  console.log('*******Login******username ',username, ' password ', password);
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

//Logout user
//Return success or error

router.post("/user/logoutuser", auth.isAuthenticated,function(req, res){
  var user = req.fbuid;
  var token = req.idToken;
     adminAuth.revokeRefreshTokens(user)
     .then(() => {
       return adminAuth.getUser(user);
     })
     .then((userRecord) => {
       return new Date(userRecord.tokensValidAfterTime).getTime() / 1000;
     })
     .then((timestamp) => {
       console.log("User tokens revoked at: ", timestamp);
   });
   res.json({"Message": "Logged out"});
  });

//GetUserdata
//Return Logged in user data

router.post("/user/getuserdata", auth.isAuthenticated,function(req, res) {
  var user = req.fbuid;
  var token = req.idToken;
  console.log('uid ', user );
  var usersRef = adminDB.ref().child('/users/'+user);
  usersRef.once('value')
  .then(function(snapshot){
    if(snapshot.val() === null){
      res.json({message: 'no data found'});
    }
    else{
      console.log("********Getting you userinfos  **************");
      res.json(snapshot.val());
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


//Post /isloggedin
//Route for creation questions
router.post("/user/isloggedin", auth.isAuthenticated,function(req, res) {
  res.json({
    response: "You sent me a  post request to islogged in " + req.user,
    body: 'req.body'
  });
});

//Post /savenewuserinfo/:id
//Route for saving a new userobject in database
router.post("/user/savenewuserinfo", auth.isAuthenticated,function(req, res){
  var user = req.user;
  var username = req.params.uname;
  var email = req.params.email;
  var imageUrl = req.params.imageUrl;
  console.log('********SAve*****username ',username, ' imageUrl ', imageUr, ' uid ', user);

    adminDB.database().ref('users/' + user.uid).set({
    username: username,
    email: email,
    profile_picture : imageUrl
  });
  res.json({
    response:"You sent me a Get request for ID by" + req.params.id
  });
});

//Post /savenewuserinfo/:id
//Route for saving a new userobject in database
router.post("/user/savemenu", auth.isAuthenticated,function(req, res){
  var user = req.fbuid;
  let responseMessage= {};
  var userRef = adminDB.ref().child('users/' + user);
  let recipesRef;
  userRef.child('savedmenues').once('value').then(snap => {
  if (snap.exists()) {
    recipesRef = userRef.child('savedmenues');
    var newMenue = recipesRef.push().set(req.body);
    responseMessage = {message:"Save were successfull", body: req.body};
  }
  else {
    userRef.set({savedmenues:"_"});
    recipesRef = useref.child('savedmenues');
    var newMenue = recipesRef.push().set(req.body);
    responseMessage = {message:"Save were successfull", body: req.body};

  }
    res.set('Content-Type', 'application/json');
    res.json(responseMessage);
}
).catch(function(error) {
  responseMessage= error;
  res.set('Content-Type', 'application/json');
  res.json(responseMessage);
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
