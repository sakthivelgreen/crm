const express = require('express');
const axios = require('axios')
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
require('dotenv').config();

// Define authorization code as a variable
let Access_Token;
let loc;
let user;
router.use(async (req, res, next) => {
    Access_Token = req.cookies.meeting_token;
    loc = req.cookies.loc;
    if (!Access_Token) {
        return res.status(401).json({ redirect: '/zoho/auth/ZohoMeeting.meeting.ALL,ZohoMeeting.manageOrg.READ' });
    } else {
        user = req.cookies.meeting_user;
        if (!user) {
            let result = await getUserDetails()
            res.cookie('meeting_user', result, {
                httpOnly: true,
                secure: false,
                maxAge: 36000
            });
            user = result;
        }
        next();
    }
});

async function getUserDetails() {
    try {
        let response = await axios.get(`https://meeting.zoho.${loc}/api/v2/user.json`, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${Access_Token}`
            }
        });
        return response.data.userDetails;
    } catch (error) {
        console.log(error)
    }
}

router.get('/user', async (req, res) => {
    res.json(user);
})
// Proxy GET request
router.get('/', async (req, res) => {
    try {
        const response = await axios.get(`https://meeting.zoho.${loc}/api/v2/${user.zsoid}/sessions.json`, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${Access_Token}`
            }
        });
        res.json({ "response": response.data, "token": Access_Token });
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

//Proxy GET Specific Meeting
router.get('/:meetingKey', async (req, res) => {
    const { meetingKey } = req.params
    try {
        const response = await axios.get(`https://meeting.zoho.${loc}/api/v2/${user.zsoid}/sessions/${meetingKey}.json`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Zoho-oauthtoken ${Access_Token}`
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Proxy POST request
router.post('/', async (req, res) => {
    try {
        const response = await axios.post(`https://meeting.zoho.${loc}/api/v2/${user.zsoid}/sessions.json`, req.body, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${Access_Token}`,
                "Content-Type": "application/json"
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Proxy PUT request
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.put(`https://meeting.zoho.${loc}/api/v2/${user.zsoid}/sessions/${id}.json`, req.body, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${Access_Token}`,
                "Content-Type": "application/json"
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Proxy DELETE request
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.delete(`https://meeting.zoho.${loc}/api/v2/${user.zsoid}/sessions/${id}.json`, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${Access_Token}`,
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});


module.exports = router;