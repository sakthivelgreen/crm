const express = require('express');
const axios = require('axios');
const cookie_parser = require('cookie-parser');
const path = require('path');
const router = express.Router();
router.use(cookie_parser());

require('dotenv').config();

router.post('/', async (req, res) => {
    try {
        const response = await axios.post("https://accounts.zoho.in/oauth/v2/token", null, {
            params: {
                refresh_token: process.env.ZOHO_MEETING_REFRESH_TOKEN,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'refresh_token',
            }
        });
        const obj = response.data
        res.json(obj);
    } catch (error) {
        res.json(error)
        res.status(error.response?.status || 500).json({ error: error.message });
    }

});

module.exports = router;