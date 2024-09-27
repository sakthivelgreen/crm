const express = require('express');
const axios = require('axios')
const router = express.Router();
const cookieParser = require('cookie-parser');

router.use(cookieParser());

// Define authorization code as a variable
let Access_Token;
router.use(async (req, res, next) => {
    Access_Token = req.cookies.token;
    if (!Access_Token) {
        let result = await token(req, res);
        if (result.success) {
            Access_Token = result.token;
            next();
        } else {
            return res.status(401).json({ error: 'Unauthorized: Token not available', Access_Token });
        }
    } else {
        next();
    }
});

const token = async (req, res) => {
    try {
        let response = await axios.post(`${process.env.BASE_URL}/token`);
        let obj = response.data;
        await res.cookie('token', obj.access_token, { httpOnly: true, secure: false, maxAge: 3600000 });
        return {
            "success": true,
            "token": obj.access_token
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Proxy GET request
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://meeting.zoho.in/api/v2/60017874042/sessions.json', {
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
        const response = await axios.get(`https://meeting.zoho.in/api/v2/60017874042/sessions/${meetingKey}.json`, {
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
        const response = await axios.post('https://meeting.zoho.in/api/v2/60017874042/sessions.json', req.body, {
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
        const response = await axios.put(`https://meeting.zoho.in/api/v2/60017874042/sessions/${id}.json`, req.body, {
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
        const response = await axios.delete(`https://meeting.zoho.in/api/v2/60017874042/sessions/${id}.json`, {
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