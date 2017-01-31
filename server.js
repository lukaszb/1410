var express = require('express');
var path = require('path');


var PORT = process.env.PORT || 5000;

app = express();
app.set('port', PORT);
app.use(express.static(path.resolve(__dirname, 'dist')));


app.listen(app.get('port'), function() {
  var url = process.env.URL || `http://localhost:${PORT}`;
  console.log(` => Serving app at ${url}`);
});
