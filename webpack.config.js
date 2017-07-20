// https://gist.github.com/learncodeacademy/25092d8f1daf5e4a6fd3
var CompressionPlugin = require("compression-webpack-plugin");

var debug = process.env.NODE_ENV !== "production"; // If environment production, use debug
var webpack = require('webpack');

module.exports = {
  context: __dirname, // Context is current directory
  devtool: debug ? "eval" : null,
  entry: "./public/js/app.js",
  output: {
    path: __dirname + "/public/js",
    filename: "app.min.js"
  },
  plugins: debug ? [] : [
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true
      },
      output: {
        comments: false,
      },
      exclude: [/\.min\.js$/gi] // skip pre-minified libs
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]), //https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0
    })
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