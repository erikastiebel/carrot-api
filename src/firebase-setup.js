const firebase = require("firebase");

// Firebase config
module.exports = {

  apiKey: process.env.API_KEY,
  authDomain: "weggo-application.firebaseapp.com",
  databaseURL: "https://weggo-application.firebaseio.com",
  projectId: "weggo-application",
  storageBucket: "weggo-application.appspot.com",
  messagingSenderId: process.env.API_SENDER
  
}
