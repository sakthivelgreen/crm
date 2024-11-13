require('dotenv').config();
const express = require('express');
const router = express.Router();
const cookie_parser = require('cookie-parser');
router.use(cookie_parser());
const axios = require('axios');

// Define authorization code as a variable
let accountId, mail_token, loc, user;

router.use(async (req, res, next) => {
    mail_token = req.cookies.mail_token;
    loc = req.cookies.loc;
    if (!mail_token) {
        return res.status(401).json({
            redirect: '/zoho/auth/ZohoMail.folders.ALL,ZohoMail.messages.ALL,ZohoMail.organization.accounts.ALL,ZohoMail.partner.organization.ALL,ZohoMail.accounts.ALL'
        });
    } else {
        let user = req.cookies.user;
        if (!user) {
            try {
                let result = await getAccountDetails(req, res, mail_token, loc);
                res.cookie('user', result, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 36000
                });
                user = result;
                accountId = result.accountId;
            } catch (error) {
                return res.status(500).json({ error: 'Failed to retrieve account details.' });
            }
        }
        accountId = user.accountId;
        next();
    }
});
async function getAccountDetails(req, res, mail_token, loc) {
    try {
        const response = await axios.get(`https://mail.zoho.${loc}/api/accounts`, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${mail_token}`
            }
        });
        return response.data.data[0];
    } catch (error) {
        console.error("Error fetching account details:", error);
        throw error; // Propagate error to be handled in middleware
    }
}


router.get('/folders', async (req, res) => {
    try {
        let response = await axios.get(`https://mail.zoho.${loc}/api/accounts/${accountId}/folders`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Zoho-oauthtoken ${mail_token}`
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
        let response = await axios.get(`https://mail.zoho.${loc}/api/accounts/${accountId}/folders/${folder}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Zoho-oauthtoken ${mail_token}`
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
        let response = await axios.get(`https://mail.zoho.${loc}/api/accounts/${accountId}/messages/view`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-oauthtoken ${mail_token}`
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
        let response = await axios.get(`https://mail.zoho.${loc}/api/accounts/${accountId}/folders/${folId}/messages/${msgId}/content`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-oauthtoken ${mail_token}`
            }
        })
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error);
    }
})

router.post('/sendMail', async (req, res) => {
    try {
        let response = await axios.post(`https://mail.zoho.${loc}/api/accounts/${accountId}/messages`)
    } catch (error) {

    }
})

module.exports = router;