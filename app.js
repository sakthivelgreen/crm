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
// var connectAndQuery = require('./routes/azure_script');
var app = express();

app.use(express.urlencoded({ extended: true })); // Parses form-encoded data
app.use(express.json()); // Parses JSON data
const corsOptions = {
    origin: 'https://sakthi-crm.vercel.app',
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type',
};
app.use(cors(corsOptions));
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
