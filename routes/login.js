const express = require('express');
const router = express.Router();
const path = require('path');

const zohoUri = {
    "eu": "https://accounts.zoho.eu",
    "au": "https://accounts.zoho.com.au",
    "in": "https://accounts.zoho.in",
    "jp": "https://accounts.zoho.jp",
    "uk": "https://accounts.zoho.uk",
    "us": "https://accounts.zoho.com",
    "ca": "https://accounts.zohocloud.ca",
    "sa": "https://accounts.zoho.sa"
}


router.get('/', async (req, res) => {
    const filePath = path.join(__dirname, "..", 'Auth', 'login.html');
    res.sendFile(filePath)
})

router.post('/', async (req, res) => {
    console.log(req.body)
})



module.exports = router;