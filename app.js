require('dotenv').config();
var express = require('express');
var path = require('path');
const cors = require('cors');
var cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000;

var indexRouter = require('./routes/index');
var mongodbRouter = require('./routes/mongodb');
var meetingsRouter = require('./routes/meetings');
var crmRouter = require('./routes/crm');
var mailRouter = require('./routes/zohoMail');
var loginRouter = require('./routes/login');
var zohoRouter = require('./routes/zoho');

var app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/Auth', express.static(path.join(__dirname, 'Auth')));
app.use(express.static(path.join(__dirname, 'Auth')));

app.use('/', indexRouter);
app.use('/mongodb', mongodbRouter);
app.use('/meetings', meetingsRouter);
app.use('/crm', crmRouter);
app.use('/mail', mailRouter);
app.use('/login', loginRouter);
app.use('/zoho', zohoRouter);

app.get('/login', async (req, res) => {
    const filePath = path.join(__dirname, 'Auth', 'login.html');
    res.sendFile(filePath)
})


app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`)
})
module.exports = app;
