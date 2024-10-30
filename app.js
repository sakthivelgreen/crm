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
var tokenRouter = require('./routes/token');
var mailRouter = require('./routes/zohoMail');

var app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/oauth', express.static(path.join(__dirname, 'oauth')));

app.use('/', indexRouter);
app.use('/mongodb', mongodbRouter);
app.use('/meetings', meetingsRouter);
app.use('/crm', crmRouter);
app.use('/token', tokenRouter);
app.use('/mail', mailRouter);

app.post('/auth/check', async (req, res) => {
    const object = req.body;
    try {
        let response = await axios.post(`https://accounts.zoho.in/oauth/v2/token`, {
            headers: {
                code: object.code,
                client_id: object.client_id,
                client_secret: object.client_secret,
                redirect_uri: "https://sakthi-crm.vercel.app/oauth",
                grant_type: "authorization_code",
            }
        });
        let obj = response.data;
        res.json(obj);
    } catch (error) {
        console.error(error);
        return false;
    }
})

app.listen(port, () => {
    console.log(`Server at http://localhost:${port}/`)
})
module.exports = app;
