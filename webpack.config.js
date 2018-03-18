var path = require('path');
var webpack = require('webpack');

module.exports = {
   entry: ['./src/scrollify.js', './src/script.js'],
   output: {
       path: path.resolve(__dirname, 'lib'),
       filename: 'scrollify.js'
   },
   watch: true,
   module: {  
       loaders: [
           {
               test: /\.js$/,
               exclude: /node-modules/,
               loader: 'babel-loader',
               query: {
                   presets: ['env']
               }
           }
       ],
   },
   stats: {
       colors: true
   },
   devtool: 'source-map'
 };
