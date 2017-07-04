// https://gist.github.com/learncodeacademy/25092d8f1daf5e4a6fd3

var debug = process.env.NODE_ENV !== "production"; // If environment production, use debug
var webpack = require('webpack');

module.exports = {
  context: __dirname, // Context is current directory
  devtool: debug ? "inline-sourcemap" : null,
  entry: "./public/js/app.js",
  output: {
    path: __dirname + "/public/js",
    filename: "app.min.js"
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(), // Remove duplicate code
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],

  // module: {
  //   loaders: [
  //     {
  //       test: /\.js$/,
  //       loader: 'babel-loader',
  //       exclude: ['/node_modules/', '/consts-sec.json', '/consts.json', '/js/sc.js', '.../sdk.js'],
  //       query: {
  //         presets: ['es2015']
  //       }
  //     }
  //   ]
  // }
};