var path = require('path');


module.exports = [appScripts()];

function appScripts() {
  return {
    entry: {app: './src/app.js'},
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
        },
      ],
    },
    output: {
      path: path.join(__dirname, 'dist/js'),
      filename: 'app.js',
    },
  };
}
