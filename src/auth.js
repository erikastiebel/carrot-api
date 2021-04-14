'use strict';

const express = require("express");
var firebaseAdmin = require("firebase-admin");

var serviceAccount = require("../weggo-application-firebase-adminsdk-owek6-ac94c7507d.json");
var adminConfig = {
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://weggo-application.firebaseio.com"
};
var adminApp = firebaseAdmin.initializeApp(adminConfig,'serviceAdminApp');
var adminAuth = adminApp.auth();

module.exports = {
  /*isAuthenticated: function(reqest,response,next){
    var user  = firebase.auth().currentUser;

    console.log('***auth next***',user);
    if (user != null){
      request.user = user;
      next();
    } else{
      response.json({"error":"not logged in"});
    }
  }*/
    isAuthenticated: function(req,res,next){
      let idToken = req.query.idToken;
      console.log('token', idToken);
      adminApp.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        var uid = decodedToken.uid;
        req.fbuid=uid;
        console.log('user ', uid);
        next()
      })
      .catch(function(error) {
        console.log('error in finding user');
        //res.redirect('/login');
      });
      }
}
