const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express();
const router = require('./routes');

app.use(bodyParser.json());
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

module.exports = app;