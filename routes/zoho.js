require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const express = require('express');
const router = express.Router();

const dt = {
    "eu": "https://accounts.zoho.eu",
    "au": "https://accounts.zoho.com.au",
    "in": "https://accounts.zoho.in",
    "jp": "https://accounts.zoho.jp",
    "uk": "https://accounts.zoho.uk",
    "us": "https://accounts.zoho.com",
    "ca": "https://accounts.zohocloud.ca",
    "sa": "https://accounts.zoho.sa"
};
const dtLoc = {
    "eu": "eu",
    "au": "au",
    "in": "in",
    "jp": "jp",
    "uk": "uk",
    "us": "com",
    "ca": "ca",
    "sa": "sa"
};

router.get('/auth/:scope', (req, res) => {
    res.redirect(`https://accounts.zoho.com/oauth/v2/auth?scope=${req.params.scope}&client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&access_type=offline`)
})

router.post('/access/:code/:location', async (req, res) => {
    const { code, location } = req.params;
    try {
        // Make a POST request with form-urlencoded data
        let response = await axios.post(
            `${dt[location]}/oauth/v2/token`,
            qs.stringify({
                code: code,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: "authorization_code"
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        let obj = response.data;
        res.cookie('token', obj.access_token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        });
        res.cookie("loc", dtLoc[location], {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        });
        res.json(obj);
    } catch (error) {
        console.error('Error during OAuth request:', error);
        res.status(500).json({ error: 'OAuth authentication failed', details: error.message });
    }
});


module.exports = router;