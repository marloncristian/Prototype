const express = require('express');
const path = require('path');
const app = express();

var port = process.env.PORT || 8080;

app.use('/static', express.static('static'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

var server = app.listen(port, function () {
    console.log('Listening port: ' + server.address().port);
});
 