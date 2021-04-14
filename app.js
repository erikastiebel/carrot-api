'use strict';
const env = require("dotenv").config();
const path = require("path");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require("./webpack.config.js");
const httpProxy = require('http-proxy');
const express = require("express");
const routes = require("./src/routes");
const jsonParser = require("body-parser").json;
const logger = require("morgan");

const port = 3000;
// We need to add a configuration to our proxy server,
// as we are now proxying outside localhost
var proxy = httpProxy.createProxyServer({
  changeOrigin:true
});

const app = express(),
      isDevelopment = process.env.NODE_ENV !== "production",
      compiler = webpack(config);
app.use(express.json());
app.set("port", process.env.PORT || port);
app.use("/api/weggo", routes);

if (isDevelopment) {
    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath
    }));
    app.use(webpackHotMiddleware(compiler));
} else {
  app.use(express.static(__dirname + "/dist"));

}

app.use(logger("dev"));
app.use(jsonParser());

//Catch 404 and forward to error handler
app.use(function(req, res, next){
  var err = new Error("Not found");
  err.status = 404;
  next(err);
});
//error handler
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({
      error: {
        message: err.message
      }
  });
});

app.listen(port, "127.0.0.1",function(){
  console.log("Express server is listening on port", port);
})
