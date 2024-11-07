require('dotenv').config();
const express = require('express');
const router = express.Router();
const cookie_parser = require('cookie-parser');
router.use(cookie_parser());
const axios = require('axios');

// Define authorization code as a variable
let message_token;
let folder_token;
let accountId = process.env.ACCOUNT_ID;

router.use(async (req, res, next) => {
    message_token = req.cookies.token_message;
    folder_token = req.cookies.token_folder;
    if (!message_token || !folder_token) {
        let result = await token(req, res);
        if (result.success) {
            message_token = result.token1;
            folder_token = result.token2;
            next();
        } else {
            return res.status(401).json({ error: 'Unauthorized: Token not available' });
        }
    } else {
        next();
    }
});

const token = async (req, res) => {
    try {
        let response1 = await axios.post(`${process.env.BASE_URL}/token/mail/messages`);
        let obj1 = response1.data;
        await res.cookie('token_message', obj1.access_token, { httpOnly: true, secure: false, maxAge: 3600000 });

        let response2 = await axios.post(`${process.env.BASE_URL}/token/mail/folders`);
        let obj2 = response2.data;
        await res.cookie('token_folder', obj2.access_token, { httpOnly: true, secure: false, maxAge: 3600000 });

        return {
            "success": true,
            "token1": obj1.access_token,
            'token2': obj2.access_token
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}


router.get('/folders', async (req, res) => {
    try {
        let response = await axios.get(`https://mail.zoho.com/api/accounts/${accountId}/folders`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Zoho-oauthtoken ${folder_token}`
                }
            });
        res.json(response.data);
    } catch (error) {
        console.log(error);
    }
})
router.get('/folder/:folder', async (req, res) => {
    let folder = req.params.folder;
    try {
        let response = await axios.get(`https://mail.zoho.com/api/accounts/${accountId}/folders/${folder}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Zoho-oauthtoken ${folder_token}`
                }
            });
        res.json(response.data);
    } catch (error) {
        console.log(error);
    }
})

router.get('/view/:folderID', async (req, res) => {
    let id = req.params.folderID;
    try {
        let response = await axios.get(`https://mail.zoho.com/api/accounts/${accountId}/messages/view`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-oauthtoken ${message_token}`
            },
            params: {
                folderId: id
            }
        })
        res.json(response.data);
    } catch (error) {
        console.log(error);
    }
});

router.get('/view/message/:mid/:fid', async (req, res) => {
    let msgId = req.params.mid;
    let folId = req.params.fid;
    try {
        let response = await axios.get(`https://mail.zoho.com/api/accounts/${accountId}/folders/${folId}/messages/${msgId}/content`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-oauthtoken ${message_token}`
            }
        })
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;