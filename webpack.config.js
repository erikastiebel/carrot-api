const path = require("path");
const webpack = require("webpack");
var nodeExternals = require('webpack-node-externals');

module.exports = {
  // context: path.resolve(__dirname, "./src"),
  entry: "./app.js",
  target: 'node',
  externals: [nodeExternals()],
  output: {
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      filename: "[name].bundle.js"
  },
  module:{
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
          options: {
            presets: ["env"]
          }
      },
    }],
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.jst$/, loader: 'ignore-loader' }
    ]
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: ['.js']
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }

};
